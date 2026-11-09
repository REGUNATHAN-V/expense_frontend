import React from 'react';
import { View, Image, Pressable, Alert } from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';

import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Text from '../../components/Text';
import Button from '../../components/Button';

import { useTheme, radius } from '../../theme/theme';
import {
  useGetCategoriesQuery,
  useCreateClaimMutation,
  useUpdateClaimMutation,
} from '../../api/apiSlice';

import { money, errMsg } from '../../utils/format';
import { ms } from '../../theme/scale';

export default function ClaimReviewScreen({ route, navigation }) {
  const { colors } = useTheme();

  const { claimData, claimId } = route.params;

  const { data: categories = [] } = useGetCategoriesQuery();

  const [createClaim, createState] = useCreateClaimMutation();
  const [updateClaim, updateState] = useUpdateClaimMutation();

  const submitting = createState.isLoading || updateState.isLoading;

  const categoryById = Object.fromEntries(
    categories.map(category => [category.id, category]),
  );

  const total = claimData.items.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );

  const submitClaim = async () => {
    try {
      let result;

      if (claimId) {
        result = await updateClaim({
          id: claimId,
          ...claimData,
          submit: true,
        }).unwrap();
      } else {
        result = await createClaim({
          ...claimData,
          submit: true,
        }).unwrap();
      }

      const id = result?.id ?? claimId;

      Alert.alert(
        'Claim submitted',
        'Your expense claim has been submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (id) {
                navigation.replace('ClaimDetail', { id });
              } else {
                navigation.popToTop();
              }
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert("Couldn't submit claim", errMsg(error));
    }
  };

  return (
    <Screen scroll keyboard edges={['left', 'right', 'bottom']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: ms(16),
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={{ marginRight: ms(12) }}
        >
          <Ionicons name="arrow-back" size={ms(24)} color={colors.text} />
        </Pressable>

        <View>
          <Text variant="h3">Review Claim</Text>
          <Text variant="caption" sub>
            Verify your details before submitting.
          </Text>
        </View>
      </View>

      <Card style={{ marginBottom: ms(12) }}>
        <Text variant="caption" sub>
          CLAIM DATE
        </Text>

        <Text variant="h3" style={{ marginTop: ms(6) }}>
          {claimData.claimDate}
        </Text>
      </Card>

      <Text variant="h3" style={{ marginBottom: ms(10) }}>
        Expense items ({claimData.items.length})
      </Text>

      {claimData.items.map((item, index) => {
        const category = categoryById[item.categoryId];

        return (
          <Card
            key={`${item.categoryId}-${index}`}
            style={{ marginBottom: ms(12) }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text variant="label" sub>
                ITEM {index + 1}
              </Text>

              <Text variant="h3" color={colors.primary}>
                {money(item.amount)}
              </Text>
            </View>

            <View style={{ marginTop: ms(14) }}>
              <Text variant="caption" sub>
                CATEGORY
              </Text>

              <Text style={{ marginTop: ms(4) }}>
                {category?.name ?? `Category #${item.categoryId}`}
              </Text>
            </View>

            <View style={{ marginTop: ms(12) }}>
              <Text variant="caption" sub>
                EXPENSE DATE
              </Text>

              <Text style={{ marginTop: ms(4) }}>{item.expenseDate}</Text>
            </View>

            {item.description ? (
              <View style={{ marginTop: ms(12) }}>
                <Text variant="caption" sub>
                  DESCRIPTION
                </Text>

                <Text style={{ marginTop: ms(4) }}>{item.description}</Text>
              </View>
            ) : null}

            {item.receiptUrl ? (
              <View style={{ marginTop: ms(12) }}>
                <Text variant="caption" sub>
                  RECEIPT LINK
                </Text>

                <Text color={colors.primary} style={{ marginTop: ms(4) }}>
                  {item.receiptUrl}
                </Text>
              </View>
            ) : null}
          </Card>
        );
      })}

      <Card
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: colors.primarySoft,
          marginBottom: ms(12),
        }}
      >
        <Text variant="h3">Total amount</Text>

        <Text variant="title" color={colors.primary}>
          {money(total)}
        </Text>
      </Card>

      <Card style={{ marginBottom: ms(16) }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: ms(8),
          }}
        >
          <Ionicons
            name="checkmark-circle"
            size={ms(20)}
            color={colors.success}
          />

          <Text variant="h3">Employee Signature</Text>
        </View>

        {claimData.signature ? (
          <View
            style={{
              marginTop: ms(14),
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.md,
              overflow: 'hidden',
            }}
          >
            <Image
              source={{ uri: claimData.signature }}
              style={{
                width: '100%',
                height: 130,
                resizeMode: 'contain',
              }}
            />
          </View>
        ) : (
          <Text color={colors.danger} style={{ marginTop: ms(10) }}>
            Signature is missing.
          </Text>
        )}
      </Card>

      <Card style={{ marginBottom: ms(14) }}>
        <Text variant="label">Confirmation</Text>

        <Text variant="caption" sub style={{ marginTop: ms(6) }}>
          I confirm that the expense details entered above are correct and that
          this claim is submitted for approval.
        </Text>
      </Card>

      <View style={{ gap: ms(10), marginBottom: ms(20) }}>
        <Button
          title="Submit for approval"
          icon="paper-plane-outline"
          onPress={submitClaim}
          loading={submitting}
          disabled={submitting || !claimData.signature}
        />

        <Button
          title="Back to edit"
          variant="ghost"
          onPress={() => navigation.goBack()}
          disabled={submitting}
        />
      </View>
    </Screen>
  );
}
