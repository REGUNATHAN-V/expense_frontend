import React, { useMemo, useRef, useState } from 'react';
import { View, Pressable, Alert, Image, Modal } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SignatureScreen from 'react-native-signature-canvas';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';

import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Text from '../../components/Text';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Sheet from '../../components/Sheet';
import DateField from '../../components/DateField';

import { useTheme, radius } from '../../theme/theme';
import {
  useGetCategoriesQuery,
  useCreateClaimMutation,
  useUpdateClaimMutation,
} from '../../api/apiSlice';

import { money, toISODate, errMsg } from '../../utils/format';
import { ms } from '../../theme/scale';
import { parseReceiptText } from '../../utils/receipt';

let seq = 0;

const newItem = (over = {}) => ({
  key: `i${++seq}`,
  categoryId: null,
  amount: '',
  expenseDate: toISODate(new Date()),
  description: '',
  receiptUrl: '',
  ...over,
});

export default function ClaimFormScreen({ route, navigation }) {
  const editing = route.params?.claim;

  const { colors } = useTheme();

  const { data: categories = [] } = useGetCategoriesQuery();

  const [createClaim, createState] = useCreateClaimMutation();
  const [updateClaim, updateState] = useUpdateClaimMutation();

  const savingDraft = createState.isLoading || updateState.isLoading;

  const [claimDate, setClaimDate] = useState(
    editing?.claimDate ?? toISODate(new Date()),
  );

  const [items, setItems] = useState(
    editing
      ? editing.items.map(item =>
          newItem({
            categoryId: item.categoryId,
            amount: String(item.amount),
            expenseDate: item.expenseDate,
            description: item.description ?? '',
            receiptUrl: item.receiptUrl ?? '',
          }),
        )
      : [newItem()],
  );

  const [signature, setSignature] = useState(editing?.signature ?? null);

  const [signatureVisible, setSignatureVisible] = useState(false);
  const [signatureRef] = useState(() => React.createRef());

  const [pickFor, setPickFor] = useState(null);
  const [errors, setErrors] = useState({});

  const catById = useMemo(
    () => Object.fromEntries(categories.map(c => [c.id, c])),
    [categories],
  );

  const total = items.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0,
  );

  const patch = (key, changes) => {
    setItems(list =>
      list.map(item => (item.key === key ? { ...item, ...changes } : item)),
    );
  };

  const addItem = () => {
    setItems(list => [...list, newItem()]);
  };

  const removeItem = key => {
    setItems(list =>
      list.length > 1 ? list.filter(item => item.key !== key) : list,
    );
  };

  const scanBill = async (itemKey, source = 'camera') => {
    try {
      const options = {
        mediaType: 'photo',
        quality: 0.8,
      };

      const result =
        source === 'camera'
          ? await launchCamera(options)
          : await launchImageLibrary(options);

      if (result.didCancel) return;

      if (result.errorCode) {
        Alert.alert(
          'Camera Error',
          result.errorMessage || 'Unable to open camera.',
        );
        return;
      }

      const asset = result.assets?.[0];

      if (!asset?.uri) return;

      const recognized = await TextRecognition.recognize(asset.uri);

      if (!recognized.text?.trim()) {
        Alert.alert('No text found', 'Please capture a clearer bill.');
        return;
      }

      const extracted = parseReceiptText(recognized.text, categories);

      patch(itemKey, {
        ...(extracted.categoryId && {
          categoryId: extracted.categoryId,
        }),
        ...(extracted.amount && {
          amount: String(extracted.amount),
        }),
        ...(extracted.expenseDate && {
          expenseDate: extracted.expenseDate,
        }),
        ...(extracted.description && {
          description: extracted.description,
        }),
      });

      console.log('OCR TEXT:', recognized.text);
      console.log('EXTRACTED DETAILS:', extracted);

      Alert.alert(
        'Bill scanned',
        'Extracted details have been filled. Please verify them.',
      );
    } catch (error) {
      console.log('OCR Error:', error);

      Alert.alert('Scan failed', 'Unable to read this receipt.');
    }
  };

  const openScanOptions = itemKey => {
    Alert.alert('Scan Receipt', 'Choose how to add your bill', [
      {
        text: 'Camera',
        onPress: () => scanBill(itemKey, 'camera'),
      },
      {
        text: 'Gallery',
        onPress: () => scanBill(itemKey, 'gallery'),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const handleSignature = signatureData => {
    if (!signatureData) {
      Alert.alert('Signature required', 'Please draw your signature.');
      return;
    }

    setSignature(signatureData);
    setSignatureVisible(false);
  };

  const clearSignature = () => {
    signatureRef.current?.clearSignature();
  };

  const validate = () => {
    const validationErrors = {};

    items.forEach(item => {
      const amount = parseFloat(item.amount);

      if (!item.categoryId) {
        validationErrors[`${item.key}.cat`] = 'Choose a category';
      }

      if (!(amount > 0)) {
        validationErrors[`${item.key}.amt`] = 'Enter an amount above 0';
      }
    });

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const getClaimBody = submit => ({
    claimDate,
    submit,
    signature,
    items: items.map(item => ({
      categoryId: item.categoryId,
      amount: parseFloat(item.amount),
      expenseDate: item.expenseDate,
      description: item.description.trim() || null,
      receiptUrl: item.receiptUrl.trim() || null,
    })),
  });

  const continueToReview = () => {
    if (!validate()) return;

    if (!signature) {
      Alert.alert(
        'Signature required',
        'Please sign to confirm your expense claim.',
      );
      return;
    }

    const claimData = getClaimBody(true);

    navigation.navigate('ClaimReview', {
      claimData,
      claimId: editing?.id ?? null,
    });
  };

  const saveDraft = async () => {
    if (!validate()) return;

    const body = getClaimBody(false);

    try {
      if (editing) {
        await updateClaim({
          id: editing.id,
          ...body,
        }).unwrap();

        Alert.alert('Success', 'Claim draft updated.', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        await createClaim(body).unwrap();

        Alert.alert('Success', 'Claim saved as draft.', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      Alert.alert("Couldn't save claim", errMsg(error));
    }
  };

  return (
    <Screen scroll keyboard edges={['left', 'right', 'bottom']}>
      <DateField label="Claim date" value={claimDate} onChange={setClaimDate} />

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: ms(10),
        }}
      >
        <Text variant="h3">Expense items</Text>

        <Pressable
          onPress={addItem}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: ms(4),
          }}
        >
          <Ionicons name="add-circle" size={ms(20)} color={colors.primary} />

          <Text variant="label" color={colors.primary}>
            Add item
          </Text>
        </Pressable>
      </View>

      {items.map((item, index) => {
        const category = catById[item.categoryId];

        const over =
          category?.maxPerItem && parseFloat(item.amount) > category.maxPerItem;

        return (
          <Card key={item.key} style={{ marginBottom: ms(12) }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: ms(12),
              }}
            >
              <Text variant="label" sub>
                ITEM {index + 1}
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: ms(12),
                }}
              >
                {items.length > 1 && (
                  <Pressable onPress={() => removeItem(item.key)} hitSlop={10}>
                    <Ionicons
                      name="trash-outline"
                      size={ms(19)}
                      color={colors.danger}
                    />
                  </Pressable>
                )}

                <Pressable
                  onPress={() => openScanOptions(item.key)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.primarySoft,
                    paddingHorizontal: ms(12),
                    paddingVertical: ms(8),
                    borderRadius: radius.md,
                    gap: ms(5),
                  }}
                >
                  <Ionicons
                    name="scan-outline"
                    size={ms(18)}
                    color={colors.primary}
                  />

                  <Text color={colors.primary} variant="label">
                    Scan Bill
                  </Text>
                </Pressable>
              </View>
            </View>

            <Text variant="label" sub style={{ marginBottom: ms(6) }}>
              Category
            </Text>

            <Pressable
              onPress={() => setPickFor(item.key)}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: colors.input,
                borderRadius: radius.md,
                padding: ms(14),
                borderWidth: 1.5,
                borderColor: errors[`${item.key}.cat`]
                  ? colors.danger
                  : 'transparent',
              }}
            >
              <Text color={category ? colors.text : colors.muted}>
                {category?.name ?? 'Select category'}
              </Text>

              <Ionicons name="chevron-down" size={ms(18)} color={colors.sub} />
            </Pressable>

            {errors[`${item.key}.cat`] ? (
              <Text
                variant="caption"
                color={colors.danger}
                style={{ marginTop: ms(4) }}
              >
                {errors[`${item.key}.cat`]}
              </Text>
            ) : null}

            <Input
              style={{ marginTop: ms(14) }}
              label="Amount"
              icon="cash-outline"
              keyboardType="decimal-pad"
              placeholder="0.00"
              value={item.amount}
              onChangeText={value =>
                patch(item.key, {
                  amount: value.replace(/[^0-9.]/g, ''),
                })
              }
              error={errors[`${item.key}.amt`]}
            />

            {over ? (
              <Text
                variant="caption"
                color={colors.warning}
                style={{
                  marginTop: ms(-8),
                  marginBottom: ms(12),
                }}
              >
                Above the {money(category.maxPerItem)} limit for {category.name}
                .
              </Text>
            ) : null}

            <DateField
              label="Expense date"
              value={item.expenseDate}
              onChange={value => patch(item.key, { expenseDate: value })}
              maximumDate={new Date()}
            />

            <Input
              label="Description (optional)"
              icon="create-outline"
              maxLength={200}
              placeholder="e.g. Airport taxi"
              value={item.description}
              onChangeText={value => patch(item.key, { description: value })}
            />

            <Input
              style={{ marginBottom: 0 }}
              label="Receipt link (optional)"
              icon="link-outline"
              maxLength={300}
              autoCapitalize="none"
              placeholder="https://…"
              value={item.receiptUrl}
              onChangeText={value => patch(item.key, { receiptUrl: value })}
            />
          </Card>
        );
      })}

      <Card style={{ marginBottom: ms(12) }}>
        <Text variant="h3">Employee Signature</Text>

        <Text variant="caption" sub style={{ marginTop: ms(4) }}>
          Sign to confirm that the expense details are correct.
        </Text>

        {signature ? (
          <View style={{ marginTop: ms(14) }}>
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.border,
                overflow: 'hidden',
              }}
            >
              <Image
                source={{ uri: signature }}
                style={{
                  width: '100%',
                  height: 120,
                  resizeMode: 'contain',
                }}
              />
            </View>

            <Pressable
              onPress={() => setSignatureVisible(true)}
              style={{
                marginTop: ms(10),
                flexDirection: 'row',
                alignItems: 'center',
                gap: ms(6),
              }}
            >
              <Ionicons
                name="create-outline"
                size={ms(18)}
                color={colors.primary}
              />

              <Text color={colors.primary} variant="label">
                Redraw Signature
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => setSignatureVisible(true)}
            style={{
              marginTop: ms(14),
              padding: ms(24),
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: colors.primary,
              borderRadius: radius.md,
              alignItems: 'center',
            }}
          >
            <Ionicons
              name="finger-print-outline"
              size={ms(32)}
              color={colors.primary}
            />

            <Text
              color={colors.primary}
              variant="label"
              style={{ marginTop: ms(8) }}
            >
              Tap here to sign
            </Text>
          </Pressable>
        )}
      </Card>

      <Card
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginVertical: ms(8),
          backgroundColor: colors.primarySoft,
        }}
      >
        <Text variant="h3">Total</Text>

        <Text variant="title" color={colors.primary}>
          {money(total)}
        </Text>
      </Card>

      <View style={{ gap: ms(10), marginTop: ms(12) }}>
        <Button
          title="Continue"
          icon="arrow-forward-outline"
          onPress={continueToReview}
        />

        <Button
          title="Save as draft"
          variant="ghost"
          onPress={saveDraft}
          loading={savingDraft}
          disabled={savingDraft}
        />
      </View>

      <Sheet
        visible={!!pickFor}
        onClose={() => setPickFor(null)}
        title="Choose category"
      >
        {categories.map(category => (
          <Pressable
            key={category.id}
            onPress={() => {
              patch(pickFor, {
                categoryId: category.id,
              });

              setPickFor(null);
            }}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: ms(14),
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View>
              <Text variant="h3">{category.name}</Text>

              {category.maxPerItem ? (
                <Text variant="caption" sub>
                  Max {money(category.maxPerItem)} per item
                </Text>
              ) : null}
            </View>

            {items.find(i => i.key === pickFor)?.categoryId === category.id ? (
              <Ionicons
                name="checkmark-circle"
                size={ms(22)}
                color={colors.primary}
              />
            ) : null}
          </Pressable>
        ))}
      </Sheet>

      <Modal
        visible={signatureVisible}
        animationType="slide"
        onRequestClose={() => setSignatureVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
            Confirm Your Signature
          </Text>

          <View
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <SignatureScreen
              ref={signatureRef}
              onOK={handleSignature}
              onEmpty={() =>
                Alert.alert('Signature required', 'Please draw your signature.')
              }
              descriptionText=""
              webStyle={`
                    .m-signature-pad {
                        box-shadow: none;
                        border: none;
                        height: 100%;
                    }
                    .m-signature-pad--body {
                        border: none;
                        bottom: 0;
                    }
                    .m-signature-pad--footer {
                        display: none;
                    }
                `}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <Pressable
              onPress={() => signatureRef.current?.clearSignature()}
              style={{
                flex: 1,
                padding: 15,
                borderRadius: 10,
                backgroundColor: '#eee',
                alignItems: 'center',
              }}
            >
              <Text>Clear</Text>
            </Pressable>

            <Pressable
              onPress={() => signatureRef.current?.readSignature()}
              style={{
                flex: 1,
                padding: 15,
                borderRadius: 10,
                backgroundColor: '#2563eb',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                Save Signature
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
