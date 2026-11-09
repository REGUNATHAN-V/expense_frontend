
export const Palette = {
    Electric: "#4F8EFF",
    ElectricDp: "#2563EB",
    Violet: "#8B5CF6",
    VioletDp: "#6D28D9",
    Cyan: "#06B6D4",

    Ink: "#080B14",
    Ink2: "#0E1220",
    Ink3: "#141927",
    Ink4: "#1C2336",
    Ink5: "#2A3352",

    Snow: "#F1F5FF",
    Mist: "#8899BB",
    Fog: "#3D4F70",

    LPage: "#F4F6FF",
    LSurface: "#FFFFFF",
    LSurfHigh: "#EEF1FF",
    LBorder: "#DDE1F5",
    LBorderFoc: "#3B82F6",
    LText1: "#0B0F1E",
    LText2: "#5A6285",
    LHint: "#ABB3CF",

    Emerald: "#10B981",
    EmeraldLt: "#34D399",
    Rose: "#F43F5E",
    RoseLt: "#FB7185",
    Amber: "#F59E0B",
    AmberLt: "#FCD34D",

    TopBarDark: "#0E1220",
    TopBarLight: "#2563EB",
    NavBarDark: "#080B14",
    NavBarLight: "#F4F6FF",
    CameraDark: "#080B14",
    TopBarDarkMain: "#0E1220",
    TopBarLightMain: "#FFFFF0",

    ErrorBg: "#F43F5E1F",
    DuplicateBg: "#F59E0B26",
    SuccessBg: "#10B9811A",
    InfoBgDark: "#4F8EFF24",
    InfoBgLight: "#2563EB1A",

    SettingsDividerDark: "#1C2336",
    SettingsDividerLight: "#EEF0FA",
    SettingsIconBgDark: "#1C2A4A",
    SettingsIconBgLight: "#EBEEFF",
    DangerTextDark: "#FF6B6B",
    DangerTextLight: "#D0353B",
    DangerBgDark: "#FF6B6B1F",
    DangerBgLight: "#D0353B14",
    SwitchTrackOffDark: "#2A3352",
    SwitchTrackOffLight: "#D6D3E8",
};

const P = Palette;

export const DarkColors = {
    isDark: true,

    bg: P.Ink,
    card: P.Ink2,
    cardAlt: P.Ink3,
    input: P.Ink3,
    glass: "#FFFFFF1A",

    border: P.Ink4,
    borderStrong: P.Ink5,
    borderFocused: P.Electric,

    text: P.Snow,
    sub: P.Mist,
    muted: P.Fog,
    disabled: P.Ink5,

    primary: P.Electric,
    primarySoft: P.SettingsIconBgDark,
    onPrimary: "#FFFFFF",
    accent: P.Violet,
    gradient: [P.Electric, P.Violet],

    success: P.EmeraldLt,
    successSoft: P.SuccessBg,
    danger: P.RoseLt,
    dangerSoft: P.ErrorBg,
    warning: P.Amber,
    warningSoft: P.DuplicateBg,
    info: P.Electric,
    infoSoft: P.InfoBgDark,
    mutedSoft: P.Ink3,

    topBar: P.TopBarDark,
    topBarMain: P.TopBarDarkMain,
    topBarContent: P.Snow,
    navBar: P.NavBarDark,
    camera: P.CameraDark,

    divider: P.SettingsDividerDark,
    iconBg: P.SettingsIconBgDark,
    dangerText: P.DangerTextDark,
    dangerBg: P.DangerBgDark,
    switchOn: P.Electric,
    switchOff: P.SwitchTrackOffDark,
    switchThumb: "#FFFFFF",
    blob: P.Electric,

    overlay: "rgba(8,11,20,0.72)",
    shadow: "#000000",
};

export const LightColors = {
    isDark: false,

    bg: P.LPage,
    card: P.LSurface,
    cardAlt: P.LSurfHigh,
    input: P.LSurface,
    glass: "#FFFFFFCC",

    border: P.LBorder,
    borderStrong: P.LBorder,
    borderFocused: P.LBorderFoc,

    text: P.LText1,
    sub: P.LText2,
    muted: P.LHint,
    disabled: P.LBorder,

    primary: P.ElectricDp,
    primarySoft: P.SettingsIconBgLight,
    onPrimary: "#FFFFFF",
    accent: P.VioletDp,
    gradient: [P.ElectricDp, P.VioletDp],

    success: "#0B9A6D",
    successSoft: P.SuccessBg,
    danger: P.DangerTextLight,
    dangerSoft: P.ErrorBg,
    warning: "#B97500",
    warningSoft: P.DuplicateBg,
    info: P.ElectricDp,
    infoSoft: P.InfoBgLight,
    mutedSoft: P.LSurfHigh,

    topBar: P.TopBarLight,
    topBarMain: P.TopBarLightMain,
    topBarContent: "#FFFFFF",
    navBar: P.NavBarLight,
    camera: P.CameraDark,

    divider: P.SettingsDividerLight,
    iconBg: P.SettingsIconBgLight,
    dangerText: P.DangerTextLight,
    dangerBg: P.DangerBgLight,
    switchOn: P.ElectricDp,
    switchOff: P.SwitchTrackOffLight,
    switchThumb: "#FFFFFF",
    blob: P.ElectricDp,

    overlay: "rgba(11,15,30,0.45)",
    shadow: "#1B2A6B",
};
