import {
  avatarClasses,
  Box,
  buttonClasses,
  chipClasses,
  formControlLabelClasses,
  formHelperTextClasses,
  iconButtonClasses,
  inputAdornmentClasses,
  InputBase,
  inputBaseClasses,
  inputClasses,
  inputLabelClasses,
  outlinedInputClasses,
  toggleButtonClasses,
  toggleButtonGroupClasses,
} from '@mui/material';
import { createTheme, Shadows } from '@mui/material/styles';
import React from 'react';

import { AVATAR_SPACING_MAP } from '@/components/Avatar/Avatar';
import Icon from '@/components/Icon';

// Global font settings
const BASE_FONT_FAMILY = [
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  '"Helvetica Neue"',
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
  'Arial',
  'sans-serif',
];
const HEADER_FONT_FAMILY = ['Matter', ...BASE_FONT_FAMILY].join(',');
const BODY_FONT_FAMILY = ['Inter', ...BASE_FONT_FAMILY].join(',');

// Color palette definitions UIKIT: https://www.figma.com/file/oFWSuE8RLD7V5dprO2P4Y6/UI-Kit?node-id=2%3A3&t=0md3Vm45FLaI2RDs-0
export const colors = {
  // WHITE
  transparent: 'transparent',
  white: '#ffffff',
  // BLUE
  blue5: '#F9FBFF',
  blue10: '#F2F7FF',
  blue20: '#E1EDFF',
  blue30: '#CCE0FF',
  blue70: '#4B9BE8',
  blue80: '#4C94FF',
  blue90: '#0066ff',
  darkBlue40: '#CCD3DE',
  darkBlue50: '#6F8EBB',
  darkBlue60: '#788BA8',
  darkBlue70: '#576E93',
  darkBlue80: '#202644',
  darkBlue90: '#0D122C',
  // GREY
  grey5: '#F4F6F9',
  grey10: '#F0F3F8',
  grey20: '#EFF2F7',
  grey30: '#E0E6F0',
  grey70: '#BFC1CC',
  grey80: '#9CA6B7',
  grey90: '#6A6E81',
  // TURQUOISE
  turquoise5: '#E4F5FF',
  turquoise90: '#58C2E8',
  // PURPLE
  purple5: '#F2F1FE',
  purple10: '#EBEAFD',
  purple20: '#DCD9FC',
  purple80: '#797EF6',
  purple90: '#60559A',
  // ORANGE
  orange5: '#FFFCF4',
  orange10: '#FFF9EB',
  orange20: '#FFF6E0',
  orange30: '#EBC47A',
  orange80: '#E4B14E',
  orange90: '#D79921',
  // MUSTARD
  mustard5: '#F9F0D0',
  mustard50: '#EED13B',
  mustard90: '#BD9B1D',
  // RED
  red5: '#FFF4F4',
  red10: '#FFE4E4',
  red20: '#FDDEDE',
  red30: '#F8A0A0',
  red60: '#F57777',
  red70: '#E84B4B',
  red80: '#D14747',
  red90: '#CD1212',
  // FOREST
  forest5: '#EBFFEE',
  forest10: '#DBFFE1',
  forest20: '#DFFFE5',
  forest30: '#B9EDC2',
  forest60: '#15C433',
  forest70: '#53A55D',
  forest80: '#39A86C',
  forest90: '#13972A',
  // EMERALD
  emerald90: '#6FBBB8',
  // BROWN
  brown10: '#FDECE4',
  brown90: '#A17866',
};

export const semanticTokens = {
  bgEnabled: colors.white,
  bgDisabled: colors.grey20,
  bgSecondary: colors.grey5,
  bgError: colors.red5,
  bgAccent: colors.blue5,
  borderEnabled: colors.grey30,
  borderHover: colors.grey70,
  borderSelected: colors.blue90,
  borderAccent: colors.blue90,
  borderError: colors.red90,
  borderDisabled: colors.transparent,
  contentPrimary: colors.darkBlue90,
  contentSecondary: colors.grey90,
  contentTertiary: colors.grey80,
  contentPlaceholder: colors.grey70,
  contentInverted: colors.white,
  contentAccent: colors.blue90,
  contentSuccess: colors.forest90,
  contentWarning: colors.orange90,
  contentError: colors.red90,
  iconBgDefault: colors.white,
  iconBgHover: colors.grey10,
  iconBgDisabled: colors.transparent,
  iconBgError: colors.transparent,
  iconBorderDefault: colors.darkBlue70,
  iconBorderEnabled: colors.darkBlue70,
  iconBorderHover: colors.darkBlue70,
  iconBorderDisabled: colors.darkBlue40,
  iconBorderError: colors.red90,
  iconBorderInverted: colors.white,
  textPrimary: colors.darkBlue90,
  textSecondary: colors.grey90,
  textTertiary: colors.grey80,
  textPlaceholder: colors.grey70,
  textSuccess: colors.forest90,
  textWarning: colors.orange90,
  textError: colors.red90,
  textInverted: colors.white,
  textHighlight: colors.blue90,
};

export const basePalette = {
  divider: colors.grey30,
  primary: {
    main: colors.darkBlue90,
  },
  white: colors.white,
  transparent: colors.transparent,
  blue: {
    main: colors.blue90,
    contrastText: colors.blue70,
    5: colors.blue5,
    10: colors.blue10,
    20: colors.blue20,
    30: colors.blue30,
    70: colors.blue70,
    80: colors.blue80,
    90: colors.blue90,
  },
  darkBlue: {
    main: colors.darkBlue90,
    light: colors.blue90,
    contrastText: colors.blue90,
    40: colors.darkBlue40,
    50: colors.darkBlue50,
    60: colors.darkBlue60,
    70: colors.darkBlue70,
    80: colors.darkBlue80,
    90: colors.darkBlue90,
  },
  // Use gray instead of grey because grey is typed by mui internally
  gray: {
    main: colors.grey90,
    contrastText: colors.grey90,
    5: colors.grey5,
    10: colors.grey10,
    20: colors.grey20,
    30: colors.grey30,
    70: colors.grey70,
    80: colors.grey80,
    90: colors.grey90,
  },
  turquoise: {
    main: colors.turquoise90,
    5: colors.turquoise5,
    90: colors.turquoise90,
  },
  purple: {
    main: colors.purple90,
    contrastText: colors.purple90,
    5: colors.purple5,
    10: colors.purple10,
    20: colors.purple20,
    80: colors.purple80,
    90: colors.purple90,
  },
  orange: {
    main: colors.orange90,
    5: colors.orange5,
    10: colors.orange10,
    20: colors.orange20,
    30: colors.orange30,
    80: colors.orange80,
    90: colors.orange90,
  },
  mustard: {
    main: colors.mustard90,
    contrastText: colors.mustard90,
    5: colors.mustard5,
    50: colors.mustard50,
    90: colors.mustard90,
  },
  red: {
    main: colors.red90,
    contrastText: colors.red70,
    5: colors.red5,
    10: colors.red10,
    20: colors.red20,
    30: colors.red30,
    60: colors.red60,
    70: colors.red70,
    80: colors.red80,
    90: colors.red90,
  },
  forest: {
    main: colors.forest90,
    contrastText: colors.forest70,
    5: colors.forest5,
    10: colors.forest10,
    20: colors.forest20,
    30: colors.forest30,
    60: colors.forest60,
    70: colors.forest70,
    80: colors.forest80,
    90: colors.forest90,
  },
  emerald: {
    main: colors.emerald90,
    90: colors.emerald90,
  },
  brown: {
    main: colors.brown90,
    contrastText: colors.brown90,
    10: colors.brown10,
    90: colors.brown90,
  },
  indigo: {
    main: colors.darkBlue50,
    contrastText: colors.darkBlue50,
  },
  lightGray: {
    main: colors.grey90,
    contrastText: colors.grey90,
  },
};

export const componentTokens = {
  button: {
    bgPrimaryEnabled: colors.blue90,
    bgPrimaryHover: colors.blue80,
    bgPrimaryDisabled: colors.blue30,
    bgDestructiveDisabled: colors.red30,
    bgDestructiveHover: colors.red80,
    bgDestructiveEnabled: colors.red90,
    bgTertiaryDisabled: colors.transparent,
    bgTertiaryHover: colors.grey10,
    bgTertiaryEnabled: colors.transparent,
    bgSecondaryDisabled: colors.transparent,
    bgSecondaryHover: colors.blue10,
    bgSecondary: colors.grey5,
    bgSecondaryEnabled: colors.transparent,
    borderDesctructiveDisabled: colors.transparent,
    borderDesctructiveHover: colors.transparent,
    borderDesctructiveEnabled: colors.transparent,
    borderTertiaryDisabled: colors.transparent,
    borderTertiaryHover: colors.transparent,
    borderTertiaryEnabled: colors.transparent,
    borderSecondaryDisabled: colors.blue30,
    borderSecondaryHover: colors.blue80,
    borderSecondaryEnabled: colors.blue90,
    borderPrimaryDisabled: colors.transparent,
    borderPrimaryHover: colors.transparent,
    borderPrimaryEnabled: colors.transparent,
    textDestructiveDisabled: colors.red30,
    textDestructiveHover: colors.red80,
    textDestructiveEnabled: colors.red90,
    textTertiaryDisabled: colors.darkBlue40,
    textTertiaryHover: colors.darkBlue60,
    textTertiaryEnabled: colors.darkBlue70,
    textSecondaryDisabled: colors.blue30,
    textSecondaryHover: colors.blue80,
    textSecondaryEnabled: colors.blue90,
    textPrimaryDisabled: colors.white,
    textPrimaryHover: colors.white,
    textPrimaryEnabled: colors.white,
  },
  calendar: {
    bgEnabled: colors.white,
    bgDisabled: colors.white,
    bgSelected: colors.blue90,
    bgRange: colors.blue20,
    bgHover: colors.white,
    bgEmpty: colors.white,
    bgCurrent: colors.white,
    textEnabled: colors.grey90,
    textDisabled: colors.grey70,
    textSelected: colors.white,
    textRange: colors.darkBlue90,
    textHover: colors.blue90,
    textEmpty: colors.white,
    textCurrent: colors.grey90,
  },
  card: {
    borderEnabled: colors.grey30,
    bgDefault: colors.white,
    bgHover: colors.blue5,
    bgSelected: colors.blue5,
  },
  chip: {
    bg: colors.grey5,
    text: colors.grey90,
  },
  date: {
    bgEnabled: semanticTokens.bgEnabled,
    bgHover: semanticTokens.bgEnabled,
    bgDisabled: semanticTokens.bgDisabled,
    bgFocus: semanticTokens.bgEnabled,
    bgSelected: semanticTokens.bgEnabled,
    bgError: semanticTokens.bgError,
    borderEnabled: semanticTokens.borderEnabled,
    borderHover: semanticTokens.borderHover,
    borderDisabled: semanticTokens.borderDisabled,
    borderFocus: semanticTokens.borderAccent,
    borderSelected: semanticTokens.borderEnabled,
    borderError: semanticTokens.borderError,
    hintsEnabled: semanticTokens.textSecondary,
    hintsHover: semanticTokens.textSecondary,
    hintsDisabled: semanticTokens.textSecondary,
    hintsFocus: semanticTokens.textSecondary,
    hintsSelected: semanticTokens.textSecondary,
    hintsError: semanticTokens.textError,
    textEnabled: semanticTokens.textPlaceholder,
    textHover: semanticTokens.textPlaceholder,
    textDisabled: semanticTokens.textPlaceholder,
    textFocus: semanticTokens.textSecondary,
    textSelected: semanticTokens.textSecondary,
    textError: semanticTokens.textError,
    titleEnabled: semanticTokens.textTertiary,
    titleHover: semanticTokens.textTertiary,
    titleDisabled: semanticTokens.textTertiary,
    titleFocus: semanticTokens.textTertiary,
    titleSelected: semanticTokens.textTertiary,
    titleError: semanticTokens.textError,
  },
  dateFilter: {
    bgEnabled: semanticTokens.bgEnabled,
    bgHover: semanticTokens.bgEnabled,
    bgDisabled: semanticTokens.bgDisabled,
    bgFocus: semanticTokens.bgEnabled,
    bgSelected: semanticTokens.bgEnabled,
    bgError: semanticTokens.bgError,
    borderEnabled: semanticTokens.borderEnabled,
    borderHover: semanticTokens.borderHover,
    borderDisabled: semanticTokens.borderDisabled,
    borderFocus: semanticTokens.borderAccent,
    borderSelected: semanticTokens.borderEnabled,
    borderError: semanticTokens.borderError,
    textEnabled: semanticTokens.textPlaceholder,
    textHover: semanticTokens.textPlaceholder,
    textDisabled: semanticTokens.textPlaceholder,
    textFocus: semanticTokens.textSecondary,
    textSelected: semanticTokens.textSecondary,
    textError: semanticTokens.textError,
  },
  timePicker: {
    bgEnabled: semanticTokens.bgEnabled,
    bgHover: semanticTokens.bgEnabled,
    bgDisabled: semanticTokens.bgDisabled,
    bgFocus: semanticTokens.bgEnabled,
    bgSelected: semanticTokens.bgEnabled,
    bgError: semanticTokens.bgError,
    borderEnabled: semanticTokens.borderEnabled,
    borderHover: semanticTokens.borderHover,
    borderDisabled: semanticTokens.borderDisabled,
    borderFocus: semanticTokens.borderAccent,
    borderSelected: semanticTokens.borderEnabled,
    borderError: semanticTokens.borderError,
    hintsEnabled: semanticTokens.textSecondary,
    hintsHover: semanticTokens.textSecondary,
    hintsDisabled: semanticTokens.textSecondary,
    hintsFocus: semanticTokens.textSecondary,
    hintsSelected: semanticTokens.textSecondary,
    hintsError: semanticTokens.textError,
    textEnabled: semanticTokens.textPlaceholder,
    textHover: semanticTokens.textPlaceholder,
    textDisabled: semanticTokens.textPlaceholder,
    textFocus: semanticTokens.textSecondary,
    textSelected: semanticTokens.textSecondary,
    textError: semanticTokens.textError,
    titleEnabled: semanticTokens.textTertiary,
    titleHover: semanticTokens.textTertiary,
    titleDisabled: semanticTokens.textTertiary,
    titleFocus: semanticTokens.textTertiary,
    titleSelected: semanticTokens.textTertiary,
    titleError: semanticTokens.textError,
  },
  timeFilter: {
    bgEnabled: semanticTokens.bgEnabled,
    bgHover: semanticTokens.bgEnabled,
    bgDisabled: semanticTokens.bgDisabled,
    bgFocus: semanticTokens.bgEnabled,
    bgSelected: semanticTokens.bgEnabled,
    bgError: semanticTokens.bgError,
    borderEnabled: semanticTokens.borderEnabled,
    borderHover: semanticTokens.borderHover,
    borderDisabled: semanticTokens.borderDisabled,
    borderFocus: semanticTokens.borderAccent,
    borderSelected: semanticTokens.borderEnabled,
    borderError: semanticTokens.borderError,
    textEnabled: semanticTokens.textPlaceholder,
    textHover: semanticTokens.textPlaceholder,
    textDisabled: semanticTokens.textPlaceholder,
    textFocus: semanticTokens.textSecondary,
    textSelected: semanticTokens.textSecondary,
    textError: semanticTokens.textError,
  },
  dropdown: {
    bgEnabled: semanticTokens.bgEnabled,
    bgHover: semanticTokens.bgEnabled,
    bgDisabled: semanticTokens.bgDisabled,
    bgFocus: semanticTokens.bgEnabled,
    bgSelected: semanticTokens.bgEnabled,
    bgError: semanticTokens.bgError,
    borderEnabled: semanticTokens.borderEnabled,
    borderHover: semanticTokens.borderHover,
    borderDisabled: semanticTokens.borderDisabled,
    borderFocus: semanticTokens.borderAccent,
    borderSelected: semanticTokens.borderEnabled,
    borderError: semanticTokens.borderError,
    hintsEnabled: semanticTokens.textSecondary,
    hintsHover: semanticTokens.textSecondary,
    hintsDisabled: semanticTokens.textSecondary,
    hintsFocus: semanticTokens.textSecondary,
    hintsSelected: semanticTokens.textSecondary,
    hintsError: semanticTokens.textError,
    textEnabled: semanticTokens.textPlaceholder,
    textHover: semanticTokens.textPlaceholder,
    textDisabled: semanticTokens.textPlaceholder,
    textFocus: semanticTokens.textSecondary,
    textSelected: semanticTokens.textSecondary,
    textError: semanticTokens.textError,
    titleEnabled: semanticTokens.textTertiary,
    titleHover: semanticTokens.textTertiary,
    titleDisabled: semanticTokens.textTertiary,
    titleFocus: semanticTokens.textTertiary,
    titleSelected: semanticTokens.textTertiary,
    titleError: semanticTokens.textError,
  },
  menu: {
    bgEnabled: colors.white,
    bgHover: colors.blue10,
    bgDisabled: semanticTokens.bgDisabled,
    bgSelected: colors.white,
    textEnabled: semanticTokens.textSecondary,
    textHover: colors.blue90,
    textDisabled: colors.darkBlue40,
    textSelected: semanticTokens.textSecondary,
    descriptionEnabled: semanticTokens.textTertiary,
    descriptionHover: colors.blue80,
    descriptionDisabled: colors.darkBlue40,
    descriptionSelected: semanticTokens.textTertiary,
  },
  input: {
    bgEnabled: semanticTokens.bgEnabled,
    bgHover: semanticTokens.bgEnabled,
    bgDisabled: semanticTokens.bgDisabled,
    bgFocus: semanticTokens.bgEnabled,
    bgTyped: semanticTokens.bgEnabled,
    bgError: semanticTokens.bgError,
    borderEnabled: semanticTokens.borderEnabled,
    borderHover: semanticTokens.borderHover,
    borderDisabled: semanticTokens.borderDisabled,
    borderFocus: semanticTokens.borderAccent,
    borderTyped: semanticTokens.borderEnabled,
    borderError: semanticTokens.borderError,
    hintsEnabled: semanticTokens.textSecondary,
    hintsHover: semanticTokens.textSecondary,
    hintsDisabled: semanticTokens.textSecondary,
    hintsFocus: semanticTokens.textSecondary,
    hintsTyped: semanticTokens.textSecondary,
    hintsError: semanticTokens.textError,
    textEnabled: semanticTokens.textPlaceholder,
    textHover: semanticTokens.textPlaceholder,
    textDisabled: semanticTokens.textPlaceholder,
    textFocus: semanticTokens.textSecondary,
    textTyped: semanticTokens.textSecondary,
    textError: semanticTokens.textError,
    titleEnabled: semanticTokens.textTertiary,
    titleHover: semanticTokens.textTertiary,
    titleDisabled: semanticTokens.textTertiary,
    titleFocus: semanticTokens.textTertiary,
    titleTyped: semanticTokens.textTertiary,
    titleError: semanticTokens.textError,
  },
  notification: {
    bgNeutral: colors.grey5,
    bgSuccess: colors.forest5,
    bgWarning: colors.orange5,
    bgError: colors.red5,
    textNeutral: colors.darkBlue70,
    textSuccess: colors.forest90,
    textWarning: colors.orange90,
    textError: colors.red90,
  },
  snackbar: {
    bgNeutral: colors.darkBlue70,
    bgSuccess: colors.forest5,
    bgWarning: colors.orange5,
    bgError: colors.red5,
    textNeutral: colors.white,
    textSuccess: colors.forest90,
    textWarning: colors.orange90,
    textError: colors.red90,
  },
  tag: {
    bgGreen: colors.forest20,
    bgRed: colors.red10,
    bgOrange: colors.orange20,
    bgPurple: colors.purple10,
    bgBrown: colors.brown10,
    bgMustard: colors.mustard5,
    bgBlue: colors.turquoise5,
    bgGrey: colors.grey30,
    bgIndigo: colors.blue20,
    bgLightGrey: colors.grey10,
    textGreen: colors.forest90,
    textRed: colors.red90,
    textOrange: colors.orange90,
    textPurple: colors.purple90,
    textBrown: colors.brown90,
    textMustard: colors.mustard90,
    textBlue: colors.blue70,
    textGrey: colors.grey90,
    textIndigo: colors.darkBlue50,
    textLightGrey: colors.grey90,
  },
};

export const palette = {
  ...semanticTokens,
  ...basePalette,
  componentToken: componentTokens,
};

// Global typography definitions
export const typographyVariants = {
  // disable unneeded default MUI variants
  h1: undefined,
  h2: undefined,
  h3: undefined,
  h4: undefined,
  h5: undefined,
  h6: undefined,
  subtitle1: undefined,
  subtitle2: undefined,
  button: undefined,
  // caption: undefined,
  overline: undefined,
  display1: {
    fontFamily: HEADER_FONT_FAMILY,
    fontWeight: 600,
    fontSize: '1.75rem',
    lineHeight: '1.875rem',
    color: palette.darkBlue[90],
  },
  headline1: {
    fontFamily: HEADER_FONT_FAMILY,
    fontWeight: 600,
    fontSize: '1.5rem',
    lineHeight: '1.625rem',
    color: palette.darkBlue[90],
  },
  headline2: {
    fontFamily: HEADER_FONT_FAMILY,
    fontWeight: 600,
    fontSize: '1.25rem',
    lineHeight: '1.5rem',
    color: palette.darkBlue[90],
  },
  headline3: {
    fontFamily: HEADER_FONT_FAMILY,
    fontWeight: 600,
    fontSize: '1rem',
    lineHeight: '1.25rem',
    color: palette.darkBlue[90],
  },
  headline4: {
    fontFamily: HEADER_FONT_FAMILY,
    fontWeight: 600,
    fontSize: '0.875rem',
    lineHeight: '1rem',
    color: palette.darkBlue[90],
  },
  headline5: {
    fontFamily: HEADER_FONT_FAMILY,
    fontWeight: 600,
    fontSize: '0.75rem',
    lineHeight: '0.875rem',
    color: palette.darkBlue[90],
  },
  body1: {
    fontFamily: BODY_FONT_FAMILY,
    fontWeight: 400,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    color: palette.gray[90],
  },
  body1sb: {
    fontFamily: BODY_FONT_FAMILY,
    fontWeight: 600,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    color: palette.gray[90],
  },
  body2: {
    fontFamily: BODY_FONT_FAMILY,
    fontWeight: 400,
    fontSize: '0.75rem',
    lineHeight: '1rem',
    color: palette.gray[90],
  },
  body2sb: {
    fontFamily: BODY_FONT_FAMILY,
    fontWeight: 600,
    fontSize: '0.75rem',
    lineHeight: '1rem',
    color: palette.gray[90],
  },
  body3: {
    fontFamily: BODY_FONT_FAMILY,
    fontWeight: 400,
    fontSize: '0.625rem',
    lineHeight: '0.75rem',
    color: palette.gray[90],
  },
  body3sb: {
    fontFamily: BODY_FONT_FAMILY,
    fontWeight: 600,
    fontSize: '0.625rem',
    lineHeight: '0.75rem',
    color: palette.gray[90],
  },
  subtitle: {
    fontFamily: HEADER_FONT_FAMILY,
    fontWeight: 600,
    fontSize: '0.75rem',
    lineHeight: '0.875rem',
    color: palette.gray[80],
  },
  link1: {
    fontFamily: BODY_FONT_FAMILY,
    fontWeight: 400,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    color: palette.gray[90],
  },
  link2: {
    fontFamily: BODY_FONT_FAMILY,
    fontWeight: 400,
    fontSize: '0.75rem',
    lineHeight: '1rem',
    color: palette.gray[90],
  },
  link3: {
    fontFamily: BODY_FONT_FAMILY,
    fontWeight: 400,
    fontSize: '0.625rem',
    lineHeight: '0.75rem',
    color: palette.gray[90],
  },
  button1: {
    fontFamily: HEADER_FONT_FAMILY,
    fontSize: '1rem',
    lineHeight: '1rem',
    fontWeight: 600,
  },
  button2: {
    fontFamily: HEADER_FONT_FAMILY,
    fontSize: '0.875rem',
    lineHeight: '1rem',
    fontWeight: 600,
  },
  button3: {
    fontFamily: HEADER_FONT_FAMILY,
    fontSize: '0.75rem',
    lineHeight: '0.875rem',
    fontWeight: 600,
  },
  clamp: {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    WebkitLineClamp: '1',
  },
  menu1: {
    fontFamily: HEADER_FONT_FAMILY,
    fontSize: '0.875rem',
    lineHeight: '1rem',
    fontWeight: 600,
  },
  menu2: {
    fontFamily: HEADER_FONT_FAMILY,
    fontSize: '0.75rem',
    lineHeight: '0.875rem',
    fontWeight: 600,
  },
  ellipsis: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  tag: {
    fontFamily: HEADER_FONT_FAMILY,
    fontWeight: 600,
    fontSize: '0.625rem',
    lineHeight: '0.75rem',
  },
} as const;

const typography = {
  fontFamily: BODY_FONT_FAMILY,
  ...typographyVariants,
};

export const shadow = {
  xs: '0px 2px 12px 2px rgba(0, 102, 255, 0.10)',
  sm: '0px 8px 10px 3px #ECECEC',
  md: '0px 8px 16px 2px rgba(0, 102, 255, 0.04)',
  lg: '0px 8px 32px 2px rgba(0, 102, 255, 0.10)',
} as const;

export const table = {
  columnSizes: {
    xxs: 44,
    xs: 96,
    sm: 120,
    md: 160,
    lg: 200,
    xl: 240,
    xxl: 320,
  },
};

export const flowBuilder = {
  start: {
    primaryColor: colors.blue90,
    secondaryColor: colors.blue20,
    icon: 'play',
  },
  action: {
    primaryColor: colors.blue70,
    secondaryColor: colors.blue20,
    icon: 'zap',
  },
  condition: {
    primaryColor: colors.orange80,
    secondaryColor: colors.orange10,
    icon: 'dataflow',
  },
  timeDelay: {
    primaryColor: colors.purple80,
    secondaryColor: colors.purple10,
    icon: 'schedule',
  },
  placeholder: {
    primaryColor: colors.grey80,
    icon: 'rocket',
  },
  end: {
    primaryColor: colors.darkBlue90,
    secondaryColor: colors.grey30,
    icon: 'flag',
  },
  jumpTo: {
    primaryColor: colors.darkBlue90,
    secondaryColor: colors.grey30,
    icon: 'flip-forward',
  },
  waitForEvent: {
    primaryColor: colors.brown90,
    secondaryColor: colors.brown10,
    icon: 'clock',
  },
  // edge
  addEdge: {
    primaryColor: colors.brown90,
    secondaryColor: colors.brown10,
    icon: 'arrow-right',
  },
} as const;

const secondaryMenu = {
  width: {
    md: 280,
    lg: 306,
  },
};

export const additionalTheme = {
  flowBuilder,
  table,
  shadow,
  secondaryMenu,
};

export const breakpoints = {
  values: {
    xs: 0,
    sm: 768,
    md: 960,
    lg: 1366,
    xl: 1920,
  },
};

export type Theme = typeof theme;

const theme = createTheme({
  // Shadows definitions
  // Reference: https://stackoverflow.com/questions/65792331/how-to-override-material-ui-shadows-in-the-theme
  shadows: [
    'none',
    '0px 2px 12px 2px hsla(216, 100%, 50%, 0.1)',
    '0px 8px 10px 3px hsla(0, 0%, 93%, 1)',
    '0px 8px 16px 2px hsla(216, 100%, 50%, 0.04)',
    '0px 8px 32px 2px hsla(216, 100%, 50%, 0.1)',
    //secondary menu shadow
    '0px 6px 16px 4px hsla(216, 100%, 50%, 0.1)',
    ...new Array(20).fill('none'),
  ] as Shadows,
  palette,
  typography,
  breakpoints,
  ...additionalTheme,
  components: {
    // Global base styles
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Matter';
          font-style: normal;
          font-weight: 600;
          font-display: swap;
          src: local('Matter'), url('/fonts/Matter-SemiBold.woff2') format('woff2');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
        @font-face {
          font-family: 'Inter';
          font-style: normal;
          font-weight: 100 900;
          font-display: swap;
          src: local('Inter'), url('/fonts/Inter-var.woff2') format('woff2');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
      `,
    },
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          headline1: 'h1',
          headline2: 'h2',
          headline3: 'h3',
          headline4: 'h4',
          headline5: 'h5',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        root: {
          '& > .MuiBackdrop-root': {
            backgroundColor: 'rgba(0,0,0,0.8)',
          },
        },
      },
    },
    // Tag styles
    MuiChip: {
      defaultProps: {
        color: 'gray',
        deleteIcon: <Icon icon="x-close" />,
        variant: 'tag',
      },
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          textTransform: 'uppercase',
          ...theme.typography.tag,
          ...(ownerState.variant === 'chip' && {
            ...theme.typography.body1,
            textTransform: 'none',
          }),
          height: '24px',
          display: 'flex',
          width: 'max-content',
          gap: theme.spacing(0.5),
          padding: theme.spacing(0, 1),
          [`&.${chipClasses.clickable}`]: {
            cursor: 'pointer',
            ':hover': {
              opacity: 0.8,
            },
          },
          [`&.${chipClasses.disabled}`]: {
            opacity: 0.6,
          },
          '& svg': {
            color: 'inherit',
            width: '16px',
            height: '16px',
          },
          // for image icons
          [`& .${avatarClasses.root}`]: {
            width: '16px',
            height: '16px',
          },
          transition: 'opacity 0.3s',
          ...(ownerState.color === 'purple' && {
            background: theme.palette.componentToken.tag.bgPurple,
            color: theme.palette.componentToken.tag.textPurple,
          }),
          ...(ownerState.color === 'red' && {
            background: theme.palette.componentToken.tag.bgRed,
            color: theme.palette.componentToken.tag.textRed,
          }),
          ...(ownerState.color === 'brown' && {
            background: theme.palette.componentToken.tag.bgBrown,
            color: theme.palette.componentToken.tag.textBrown,
          }),
          ...(ownerState.color === 'mustard' && {
            background: theme.palette.componentToken.tag.bgMustard,
            color: theme.palette.componentToken.tag.textMustard,
          }),
          ...(ownerState.color === 'forest' && {
            background: theme.palette.componentToken.tag.bgGreen,
            color: theme.palette.componentToken.tag.textGreen,
          }),
          ...(ownerState.color === 'blue' && {
            background: theme.palette.componentToken.tag.bgBlue,
            color: theme.palette.componentToken.tag.textBlue,
          }),
          ...(ownerState.color === 'gray' && {
            background: theme.palette.componentToken.tag.bgGrey,
            color: theme.palette.componentToken.tag.textGrey,
          }),
          ...(ownerState.color === 'indigo' && {
            background: theme.palette.componentToken.tag.bgIndigo,
            color: theme.palette.componentToken.tag.textIndigo,
          }),
          ...(ownerState.color === 'lightGray' && {
            background: theme.palette.componentToken.tag.bgLightGrey,
            color: theme.palette.componentToken.tag.textLightGrey,
          }),
        }),
        label: {
          padding: 0,
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          maxWidth: '148px',
        },
        icon: {
          margin: 0,
          width: '12px',
          height: '12px',
        },
        deleteIcon: ({ theme }) => ({
          color: 'inherit',
          ':hover': {
            color: 'inherit',
            opacity: 0.6,
          },
          margin: theme.spacing(0.25),
          flexShrink: 0,
          width: '10px',
          height: '10px',
        }),
      },
    },
    MuiInputLabel: {
      defaultProps: {
        // HACK: makes sure placeholder can be seen at all times
        shrink: true,
      },
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          zIndex: 1,
          ...theme.typography.subtitle,
          transform: 'none',
          textTransform: 'uppercase',
          transition: 'none',
          position: 'static',
          marginBottom: theme.spacing(1),
          color: theme.palette.componentToken.input.titleEnabled,
          [`&.${inputLabelClasses.error}`]: {
            color: theme.palette.componentToken.input.titleError,
          },
          [`&.${inputLabelClasses.focused}`]: {
            color: theme.palette.componentToken.input.titleFocus,
          },
          [`&.${inputLabelClasses.disabled}`]: {
            color: theme.palette.componentToken.input.titleDisabled,
          },
        }),
      },
    },
    MuiInputBase: {
      defaultProps: {
        size: 'medium',
      },
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          [`&.${inputBaseClasses.root}.${inputBaseClasses.root}.${inputBaseClasses.focused}`]:
            {
              boxShadow: 'none',
            },
          [`&.${inputBaseClasses.root}`]: {
            // gets rid of MUI default label behaviour
            '& legend': { display: 'none' },
            '& fieldset': {
              top: 0,
              outline: 'none',
              border: 'none',
            },
          },
          padding: 0,
          display: 'flex',
          gap: theme.spacing(0.5),
          alignItems: 'center',
          borderRadius: theme.shape.borderRadius,
          outline: 'none',
          height: '40px',
          ...(ownerState.size === 'compact-medium' && {
            height: 'auto',
          }),
          ...(ownerState.size === 'small' && {
            height: '32px',
          }),
          ...(ownerState.multiline && {
            height: '100%',
            minHeight: '40px',
          }),
        }),
        input: ({ theme, ownerState }) => ({
          [`&.${inputBaseClasses.input}`]: {
            padding: theme.spacing(1.15, 1.5),
            ...(ownerState.size === 'compact-medium' && {
              padding: 0,
            }),
          },
        }),
      },
    },
    MuiInput: {
      defaultProps: {
        disableUnderline: true,
      },
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          color: theme.palette.componentToken.input.textTyped,
          fill: theme.palette.componentToken.input.textTyped,
          [`&.${inputClasses.error}`]: {
            color: theme.palette.componentToken.input.textError,
            ':hover': {
              borderColor: theme.palette.componentToken.input.borderError,
            },
          },
          [`&.${inputClasses.disabled}`]: {
            color: theme.palette.componentToken.input.textDisabled,
            ':hover': {
              borderColor: theme.palette.componentToken.input.borderDisabled,
            },
          },
          [`&.${inputClasses.root}.${inputClasses.focused},&:focus-within`]: {
            color: theme.palette.componentToken.input.textTyped,
          },
        }),
        input: ({ theme }) => ({
          border: 'none',
          width: '100%',
          background: theme.palette.transparent,
          outline: 'none',
          ...theme.typography.body1,
          color: 'inherit',
          '&::placeholder': {
            opacity: 1,
            color: theme.palette.componentToken.input.textEnabled,
          },
          '&:placeholder-shown': {
            textOverflow: 'ellipsis',
          },
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          [`&.${outlinedInputClasses.root}`]: {
            background: theme.palette.componentToken.input.bgEnabled,
            ':hover': {
              borderColor: theme.palette.componentToken.input.borderHover,
            },
            color: theme.palette.componentToken.input.textTyped,
            fill: theme.palette.componentToken.input.textTyped,
            border: '1px solid',
            borderColor: theme.palette.componentToken.input.borderEnabled,
            [`&.${inputClasses.error}`]: {
              borderColor: theme.palette.componentToken.input.borderError,
              background: theme.palette.componentToken.input.bgError,
              color: theme.palette.componentToken.input.textError,
              ':hover': {
                borderColor: theme.palette.componentToken.input.borderError,
              },
            },
            [`&.${inputClasses.disabled}`]: {
              color: theme.palette.componentToken.input.textDisabled,
              background: theme.palette.componentToken.input.bgDisabled,
              borderColor: theme.palette.componentToken.input.borderDisabled,
              ':hover': {
                borderColor: theme.palette.componentToken.input.borderDisabled,
              },
            },
          },
          [`&.${outlinedInputClasses.root}.${outlinedInputClasses.focused},&:focus-within`]:
            {
              background: theme.palette.componentToken.input.bgFocus,
              borderColor: theme.palette.componentToken.input.borderFocus,
              boxShadow: theme.shadow.xs,
              color: theme.palette.componentToken.input.textTyped,
              ':hover': {
                borderColor: theme.palette.componentToken.input.borderFocus,
              },
            },
          [`& .${inputAdornmentClasses.root}`]: {
            color: theme.palette.componentToken.input.textEnabled,
          },
          [`&.${outlinedInputClasses.error} .${inputAdornmentClasses.root}`]: {
            color: theme.palette.componentToken.input.textError,
          },
          [`&.${outlinedInputClasses.focused} .${inputAdornmentClasses.root}`]:
            {
              color: theme.palette.componentToken.input.textEnabled,
            },
          [`&.${outlinedInputClasses.disabled} .${inputAdornmentClasses.root}`]:
            {
              color: theme.palette.componentToken.input.textDisabled,
            },
        }),
        input: ({ theme }) => ({
          [`&.${outlinedInputClasses.input}`]: {
            border: 'none',
            width: '100%',
            background: theme.palette.transparent,
            outline: 'none',
            ...theme.typography.body1,
            color: 'inherit',
            '&::placeholder': {
              opacity: 1,
              color: theme.palette.componentToken.input.textEnabled,
            },
            '&:placeholder-shown': {
              textOverflow: 'ellipsis',
            },
          },
        }),
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...theme.typography.body1,
          color: 'inherit',
          // HACK to fix the font color of the input adornment
          '& p': {
            ...theme.typography.body1,
            color: 'inherit',
          },
          fill: 'inherit',
          '& svg': {
            width: '16px',
            height: '16px',
          },
          [`& .${iconButtonClasses.root}.${iconButtonClasses.root}`]: {
            color: theme.palette.gray[70],
            width: 'min-content',
            height: 'min-content',
            ':hover': {
              background: theme.palette.transparent,
              color: theme.palette.gray[70],
            },
          },
        }),
      },
    },
    //Form helper text style
    MuiFormHelperText: {
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          ...theme.typography.body2,
          color: theme.palette.componentToken.input.hintsEnabled,
          ':hover': {
            color: theme.palette.componentToken.input.hintsHover,
          },
          [`&.${formHelperTextClasses.error}`]: {
            color: theme.palette.componentToken.input.hintsError,
            ':hover': {
              color: theme.palette.componentToken.input.hintsError,
            },
          },
          [`&.${formHelperTextClasses.focused}`]: {
            color: theme.palette.componentToken.input.hintsFocus,
            ':hover': {
              color: theme.palette.componentToken.input.hintsFocus,
            },
          },
          [`&.${formHelperTextClasses.disabled}`]: {
            color: theme.palette.componentToken.input.hintsDisabled,
            ':hover': {
              color: theme.palette.componentToken.input.hintsDisabled,
            },
          },
          margin: theme.spacing(1, 0),
        }),
      },
    },
    //Form Label style
    MuiFormLabel: {
      styleOverrides: {
        root: {
          ...typography.subtitle,
          margin: '8px 0',
          textTransform: 'uppercase',
          '&.Mui-disabled': {
            ...typography.subtitle,
          },
          '&.Mui-focused': {
            ...typography.subtitle,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& input[type=number]': {
            appearance: 'textfield',
          },
          '& input[type=number]::-webkit-outer-spin-button': {
            appearance: 'none',
            margin: 0,
          },
          '& input[type=number]::-webkit-inner-spin-button': {
            appearance: 'none',
            margin: 0,
          },
        },
      },
    },
    // Button styles
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButton: {
      defaultProps: {
        size: 'small',
        variant: 'tertiary',
        color: 'blue',
      },
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          [`&.${buttonClasses.root}`]: {
            textDecoration: 'none',
          },
          boxShadow: 'none',
          position: 'relative',
          border: '1px solid',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          transition: 'all 0.25s ease-in-out',
          cursor: 'pointer',
          ...((ownerState.size === 'large' || ownerState.size === 'lg') && {
            ...theme.typography.button1,
            padding: theme.spacing(1.375, 2.5),
            minHeight: '40px',
            minWidth: '106px',
          }),
          ...(ownerState.size === 'compact-large' && {
            ...theme.typography.button1,
            padding: theme.spacing(1.375, 0.5),
            minHeight: '40px',
          }),
          ...((ownerState.size === 'small' || ownerState.size === 'sm') && {
            ...theme.typography.button2,
            padding: theme.spacing(0.9, 2.5),
            minWidth: '96px',
            minHeight: '32px',
          }),
          ...(ownerState.size === 'compact-small' && {
            ...theme.typography.button2,
            padding: theme.spacing(0.9, 0.5),
            minHeight: '32px',
          }),
          ...((ownerState.variant === 'primary' ||
            ownerState.variant === 'contained') && {
            color: theme.palette.componentToken.button.textPrimaryEnabled,
            borderColor:
              theme.palette.componentToken.button.borderPrimaryEnabled,
            background: theme.palette.componentToken.button.bgPrimaryEnabled,
            ...(ownerState.color === 'red' && {
              color: theme.palette.componentToken.button.textPrimaryEnabled,
              borderColor:
                theme.palette.componentToken.button.borderPrimaryEnabled,
              background: theme.palette.red[90],
            }),
            ...(ownerState.color === 'mustard' && {
              color: theme.palette.componentToken.button.textPrimaryEnabled,
              borderColor:
                theme.palette.componentToken.button.borderPrimaryEnabled,
              background: theme.palette.orange[90],
            }),
            ...(!ownerState.disabled && {
              ':hover': {
                color: theme.palette.componentToken.button.textPrimaryHover,
                borderColor:
                  theme.palette.componentToken.button.borderPrimaryHover,
                background: theme.palette.componentToken.button.bgPrimaryHover,
                ...(ownerState.color === 'red' && {
                  color: theme.palette.componentToken.button.textPrimaryHover,
                  background: theme.palette.red[80],
                  borderColor:
                    theme.palette.componentToken.button.borderPrimaryHover,
                }),
                ...(ownerState.color === 'mustard' && {
                  color: theme.palette.componentToken.button.textPrimaryHover,
                  background: theme.palette.orange[80],
                  borderColor:
                    theme.palette.componentToken.button.borderPrimaryHover,
                }),
              },
            }),
            [`&.${buttonClasses.disabled}`]: {
              color: theme.palette.componentToken.button.textPrimaryDisabled,
              borderColor:
                theme.palette.componentToken.button.borderPrimaryDisabled,
              background: theme.palette.componentToken.button.bgPrimaryDisabled,
            },
          }),
          ...((ownerState.variant === 'secondary' ||
            ownerState.variant === 'outlined') && {
            color: theme.palette.componentToken.button.textSecondaryEnabled,
            borderColor:
              theme.palette.componentToken.button.borderSecondaryEnabled,
            background: theme.palette.componentToken.button.bgSecondaryEnabled,
            ...(ownerState.color === 'red' && {
              borderColor: theme.palette.red[90],
              color: theme.palette.red[90],
              background:
                theme.palette.componentToken.button.bgSecondaryEnabled,
            }),
            ...(ownerState.color === 'mustard' && {
              borderColor: theme.palette.orange[90],
              color: theme.palette.orange[90],
              background:
                theme.palette.componentToken.button.bgSecondaryEnabled,
            }),
            ...(!ownerState.disabled && {
              ':hover': {
                borderColor:
                  theme.palette.componentToken.button.borderSecondaryHover,
                color: theme.palette.componentToken.button.textSecondaryHover,
                background:
                  theme.palette.componentToken.button.bgSecondaryHover,
                ...(ownerState.color === 'red' && {
                  borderColor: theme.palette.red[90],
                  color: theme.palette.red[90],
                  background: theme.palette.red[5],
                }),
                ...(ownerState.color === 'mustard' && {
                  borderColor: theme.palette.orange[90],
                  color: theme.palette.orange[90],
                  background: theme.palette.orange[10],
                }),
              },
            }),
            [`&.${buttonClasses.disabled}`]: {
              borderColor:
                theme.palette.componentToken.button.borderSecondaryDisabled,
              color: theme.palette.componentToken.button.textSecondaryDisabled,
              background:
                theme.palette.componentToken.button.bgSecondaryDisabled,
            },
          }),
          ...((ownerState.variant === 'tertiary' ||
            ownerState.variant === 'text') && {
            color: theme.palette.componentToken.button.textTertiaryEnabled,
            borderColor:
              theme.palette.componentToken.button.borderTertiaryEnabled,
            background: theme.palette.componentToken.button.bgSecondaryEnabled,
            ...(ownerState.color === 'red' && {
              color: theme.palette.red[90],
            }),
            ...(ownerState.color === 'mustard' && {
              color: theme.palette.orange[90],
            }),
            ...(ownerState.color === 'purple' && {
              color: theme.palette.purple[80],
            }),
            ...(!ownerState.disabled && {
              ':hover': {
                borderColor:
                  theme.palette.componentToken.button.borderTertiaryHover,
                color: theme.palette.componentToken.button.textTertiaryHover,
                background: theme.palette.componentToken.button.bgTertiaryHover,
                ...(ownerState.color === 'red' && {
                  color: theme.palette.red[90],
                  background: theme.palette.red[5],
                }),
                ...(ownerState.color === 'mustard' && {
                  color: theme.palette.orange[90],
                  background: theme.palette.orange[10],
                }),
                ...(ownerState.color === 'purple' && {
                  color: theme.palette.purple[80],
                  background: theme.palette.purple[10],
                }),
              },
            }),
            [`$.${buttonClasses.disabled}`]: {
              color: theme.palette.componentToken.button.textPrimaryDisabled,
              borderColor:
                theme.palette.componentToken.button.borderPrimaryDisabled,
              background: theme.palette.componentToken.button.bgPrimaryDisabled,
            },
          }),
        }),
      },
    },
    // Checkbox styles
    MuiCheckbox: {
      variants: [
        {
          props: { size: 'small' },
          style: {
            width: 16,
            height: 16,
          },
        },
        {
          props: { size: 'medium' },
          style: {
            width: 20,
            height: 20,
          },
        },
      ],
      defaultProps: {
        size: 'medium',
        indeterminateIcon: (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              background: colors.grey80,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '4px',
              border: `1px solid ${colors.grey80}`,
            }}
          >
            <Icon icon={'minus'} sx={{ color: 'white' }} size={12} />
          </Box>
        ),
        icon: (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              background: colors.white,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '4px',
              border: `1px solid ${colors.grey30}`,
            }}
          />
        ),
        checkedIcon: (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              background: colors.blue90,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '4px',
              border: `1px solid ${colors.blue90}`,
            }}
          >
            <Icon icon={'check-single'} sx={{ color: 'white' }} size={12} />
          </Box>
        ),
      },
      styleOverrides: {
        root: {
          padding: '2px',
          '& > .MuiSvgIcon-root': {
            fill: colors.grey30,
          },
          ':hover': {
            '& > .MuiSvgIcon-root': {
              fill: colors.blue90,
            },
          },
          '&.MuiCheckbox-indeterminate > .MuiSvgIcon-root': {
            fill: colors.grey80,
          },
          '&.Mui-checked > .MuiSvgIcon-root': {
            fill: colors.blue90,
          },
          '&.Mui-disabled > .MuiBox-root': {
            background: colors.grey20,
            border: 'none',
          },
          '&.Mui-disabled > .MuiBox-root > svg': {
            color: colors.grey70,
          },
          '&.Mui-checked:hover': {
            borderTopRightRadius: '5px',
            borderTopLeftRadius: '5px',
            borderBottomRightRadius: '5px',
            borderBottomLeftRadius: '5px',
            padding: '2px',
            backgroundColor: 'rgba(0, 102, 255, 0.1)',
          },
        },
      },
    },
    // Switch styles
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: '26px',
          height: '16px',
          padding: 0,
          display: 'flex',
        },
        switchBase: {
          padding: 2,
          '&.Mui-disabled + .MuiSwitch-track': {
            backgroundColor: colors.grey90,
          },
          '&.Mui-checked.Mui-disabled': {
            color: '#fff',
          },
          '&.Mui-checked.Mui-disabled + .MuiSwitch-track': {
            backgroundColor: colors.forest30,
          },
          '&.Mui-checked': {
            transform: 'translateX(10px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
              opacity: 1,
              backgroundColor: colors.forest90,
            },
          },
        },
        thumb: {
          color: '#fff',
          boxShadow: 'none',
          width: 12,
          height: 12,
          borderRadius: 6,
        },
        track: {
          borderRadius: 16 / 2,
          opacity: 1,
          backgroundColor: colors.grey70,
          boxSizing: 'border-box',
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: ({ theme }) => ({
          boxShadow: theme.shadow.lg,
        }),
      },
    },
    // Menu styles
    MuiMenu: {
      styleOverrides: {
        root: {
          '& > .MuiPaper-root': {
            boxShadow: '0px 8px 32px 2px rgba(0, 102, 255, 0.1)',
          },
        },
        list: {
          padding: '12px 0 4px 0',
          minWidth: '120px',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          ...typography.body1,
          backgroundColor: colors.white,
          "&[aria-selected='true']": {
            backgroundColor: colors.blue5,
            color: colors.blue90,
            '&:hover': {
              backgroundColor: colors.blue10,
              color: colors.blue90,
            },
          },
          '&.Mui-selected': {
            backgroundColor: colors.blue5,
            color: colors.blue90,
            '&:hover': {
              backgroundColor: colors.blue10,
              color: colors.blue90,
            },
          },
          '&.MuiButtonBase-root.MuiMenuItem-root.Mui-focusVisible': {
            backgroundColor: `${colors.blue10}`,
            color: colors.blue90,
            '&:hover': {
              backgroundColor: colors.blue10,
              color: colors.blue90,
            },
          },
          '&:hover': {
            color: colors.blue90,
            backgroundColor: colors.blue10,
          },
          '&:focus': {
            color: colors.blue90,
            backgroundColor: colors.blue5,
          },

          padding: '8px 12px',
          minHeight: 'unset',
          marginBottom: '8px',
        },
      },
    },
    // Icon button styles
    MuiIconButton: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          position: 'relative',
          border: '1px solid',
          display: 'flex',
          justifyItems: 'center',
          alignItems: 'center',
          transition: 'all 0.25s ease-in-out',
          cursor: 'pointer',
          padding: 0,
          borderRadius: theme.shape.borderRadius * 2,
          ...(ownerState.size === 'large' && {
            ...theme.typography.button1,
            width: '40px',
            height: '40px',
            '& svg': {
              color: 'inherit',
              width: '20px',
              height: '20px',
            },
          }),
          ...((ownerState.size === 'small' || ownerState.size === 'sm') && {
            ...theme.typography.button2,
            width: '32px',
            height: '32px',
            '& svg': {
              color: 'inherit',
              width: '20px',
              height: '20px',
            },
          }),
          color: theme.palette.componentToken.button.textTertiaryEnabled,
          ...(ownerState.color === 'red' && {
            color: theme.palette.red[90],
          }),
          ...(ownerState.color === 'mustard' && {
            color: theme.palette.orange[90],
          }),
          borderColor:
            theme.palette.componentToken.button.borderTertiaryEnabled,
          background: theme.palette.componentToken.button.bgTertiaryEnabled,
          [`&:not(.${iconButtonClasses.disabled})`]: {
            ':hover': {
              borderColor:
                theme.palette.componentToken.button.borderTertiaryHover,
              color: theme.palette.componentToken.button.textTertiaryHover,
              background: theme.palette.componentToken.button.bgTertiaryHover,
              ...(ownerState.color === 'red' && {
                color: theme.palette.red[90],
                background: theme.palette.red[5],
              }),
              ...(ownerState.color === 'mustard' && {
                color: theme.palette.orange[90],
                background: theme.palette.orange[10],
              }),
            },
          },
          [`&.${iconButtonClasses.disabled}`]: {
            borderColor:
              theme.palette.componentToken.button.borderTertiaryDisabled,
            color: theme.palette.componentToken.button.textTertiaryDisabled,
            background: theme.palette.componentToken.button.bgTertiaryDisabled,
            pointerEvents: 'auto', // ref: https://stackoverflow.com/questions/61115913/is-it-possible-to-render-a-tooltip-on-a-disabled-mui-button-within-a-buttongroup
          },
        }),
      },
    },
    // List item text styles
    MuiListItemText: {
      styleOverrides: {
        root: {
          margin: 0,
        },
      },
    },
    // Table styles
    MuiTableContainer: {
      styleOverrides: {
        root: {
          boxShadow: 'unset',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          ...typography.headline4,
          '&:hover': {
            backgroundColor: 'none',
          },
          background: colors.grey20,
        },
      },
    },
    MuiTableRow: {
      variants: [
        {
          props: { selected: true },
          style: {
            fontWeight: 600,
          },
        },
      ],
      styleOverrides: {
        head: {
          '&:hover': {
            backgroundColor: 'unset',
          },
        },
        root: {
          height: '48px',
          '&.Mui-selected': {
            backgroundColor: colors.blue10,
            '&:hover': {
              backgroundColor: colors.blue10,
            },
          },
          '&:hover': {
            backgroundColor: colors.blue10,
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          ...typography.body2,
          color: colors.darkBlue90,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          whiteSpace: 'nowrap',
          color: 'inherit',
          borderBottom: `1px solid ${colors.grey10}`,
          fontFamily: 'inherit',
          fontSize: 'inherit',
          fontWeight: 'inherit',
          lineHeight: 'inherit',
          padding: '0px 12px',
          height: '48px',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          '&.MuiLinearProgress-root': {
            background: colors.grey30,
            height: '8px',
            borderRadius: '500px',
          },
          '&.MuiLinearProgress-root .MuiLinearProgress-bar': {
            background: colors.blue90,
            borderRadius: '500px',
          },
          '& .MuiLinearProgress-bar2Buffer': {
            backgroundColor: `${colors['blue30']}!important`,
          },
          '& .MuiLinearProgress-dashed': {
            backgroundImage: 'none',
            animation: 'none',
          },
        },
      },
    },
    // pagination style
    MuiPagination: {
      defaultProps: {
        shape: 'rounded',
        showFirstButton: true,
        showLastButton: true,
      },
      styleOverrides: {
        root: {
          ...typography.menu2,
          '.MuiPagination-ul': {
            flexWrap: 'nowrap',
          },
          button: {
            '&.MuiPaginationItem-root.Mui-selected': {
              color: 'white',
              background: colors.blue90,
            },
            '&:hover': {
              background: colors.blue5,
              color: colors.blue90,
            },
          },
        },
      },
    },
    MuiPaginationItem: {
      defaultProps: {
        components: {
          first: () => <Icon icon="chevron-left-double" size={16} />,
          last: () => <Icon icon="chevron-right-double" size={16} />,
          next: () => <Icon icon="chevron-right" size={16} />,
          previous: () => <Icon icon="chevron-left" size={16} />,
        },
      },
      styleOverrides: {
        root: {
          ...typography.menu2,
          color: colors.darkBlue70,
        },
      },
    },
    MuiTooltip: {
      defaultProps: {
        enterDelay: 250,
        enterNextDelay: 250,
      },
      styleOverrides: {
        tooltip: ({ ownerState }) => ({
          ...typography.body2,
          padding: '12px 16px',
          borderRadius: '4px',
          color: colors.white,
          background: colors.darkBlue70,
          ...(ownerState.size === 'sm' && {
            padding: '4px 8px',
          }),
        }),
      },
    },
    MuiBadge: {
      defaultProps: {
        color: 'default',
      },
      styleOverrides: {
        root: {
          width: 'min-content',
        },
        badge: ({ theme, ownerState }) => ({
          ...theme.typography.button3,
          border: '2px solid',
          height: 'auto',
          borderColor: theme.palette.white,
          borderRadius: theme.shape.borderRadius * 999,
          padding: 0,
          ...(ownerState.variant === 'relative' && {
            transform: 'none',
            position: 'relative',
          }),
          ...(ownerState.color === 'red' && {
            background: theme.palette.red[80],
            color: theme.palette.white,
            padding: theme.spacing(0.25, 0.75),
          }),
          ...(ownerState.color === 'blue' && {
            background: theme.palette.blue[90],
            color: theme.palette.white,
            padding: theme.spacing(0.25, 0.75),
          }),
          ...(ownerState.color === 'lightGray' && {
            background: theme.palette.gray[10],
            color: theme.palette.gray[80],
            padding: theme.spacing(0.25, 0.75),
          }),
          ...(ownerState.color === 'forest' && {
            background: theme.palette.forest[60],
            color: theme.palette.white,
            padding: theme.spacing(0.25, 0.75),
          }),
          ...(ownerState.color === 'gray' && {
            background: theme.palette.gray[80],
            color: theme.palette.white,
            padding: theme.spacing(0.25, 0.75),
          }),
          ...(ownerState.variant === 'dot' && {
            width: '12px',
            height: '12px',
            padding: 0,
          }),
          '& svg': {
            width: '16px',
            height: '16px',
          },
          // for image badges
          [`& .${avatarClasses.root}`]: {
            width: '16px',
            height: '16px',
          },
        }),
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: colors.grey20,
        },
      },
      variants: [
        {
          props: { variant: 'rectangular' },
          style: {
            borderRadius: '4px',
          },
        },
      ],
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          '&.MuiRadio-root + span': {
            paddingLeft: '8px',
            color: colors.grey90,
          },
          '&.MuiRadio-root.Mui-checked + span': {
            color: colors.darkBlue90,
          },
          color: colors.grey30,
          '&.Mui-checked:not(.Mui-disabled)': {
            backgroundColor: colors.blue5,
            color: colors.blue90,
          },
          '& .MuiSvgIcon-root': {
            fontSize: 20,
          },
          width: '20px',
          height: '20px',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: ({ theme }) => ({
          ...theme.typography.button3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
        }),
      },
    },
    MuiAvatarGroup: {
      styleOverrides: {
        root: ({ theme, ownerState }) => {
          const total =
            ownerState.total ||
            (ownerState.children as React.ReactElement[])?.length;
          const max = ownerState.max!;
          const isOverMax = total > max;

          return {
            [`& .${avatarClasses.root}`]: {
              border: '1px solid',
              borderColor: theme.palette.white,
              boxSizing: 'content-box',
              ...((ownerState.spacing === 'small' ||
                ownerState.spacing === 'medium') && {
                marginLeft: `${
                  AVATAR_SPACING_MAP[ownerState.spacing]
                }px !important`,
              }),
              ...(typeof ownerState.spacing === 'number' && {
                marginLeft: `${ownerState.spacing}px !important`,
              }),
            },
            ...(isOverMax && {
              [`& .${avatarClasses.root}:first-child`]: {
                background: theme.palette.blue[10],
                borderColor: theme.palette.white,
                color: theme.palette.blue[90],
              },
            }),
          };
        },
      },
      defaultProps: {
        spacing: 'medium',
      },
    },
    MuiAlert: {
      defaultProps: {
        color: 'info',
        slots: {
          closeIcon: () => <Icon icon="x-close" size={20} />,
        },
      },
      // Remove default padding for icon, message and action.
      // Centralise the padding on root instead for better spacing control.
      styleOverrides: {
        root: {
          ...typography.body1,
          borderRadius: '8px',
          padding: '16px 20px',
          alignItems: 'center',
        },
        icon: {
          display: 'none',
        },
        message: {
          padding: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        },
        action: {
          padding: 0,
          marginLeft: '30px',
          marginRight: 0,
          alignItems: 'center',
          '& > .MuiButtonBase-root': {
            ...typography.button2,
            padding: 0,
            color: colors.white,
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: 'transparent',
            },
            '& > svg': {
              display: 'none',
            },
          },
        },
      },
      variants: [
        {
          props: { color: 'info' },
          style: {
            backgroundColor: colors.darkBlue70,
            color: colors.white,
            '& > .MuiAlert-action': {
              '.MuiButtonBase-root': {
                color: '#fff',
              },
            },
          },
        },
        {
          props: { color: 'error' },
          style: {
            backgroundColor: colors.red5,
            color: colors.red90,
            '& > .MuiAlert-action': {
              svg: {
                color: colors.red90,
              },
            },
          },
        },
        {
          props: { color: 'success' },
          style: {
            backgroundColor: colors.forest5,
            color: colors.forest90,
            '& > .MuiAlert-action': {
              svg: {
                color: colors.forest90,
              },
            },
          },
        },
        {
          props: { color: 'warning' },
          style: {
            backgroundColor: colors.orange20,
            color: colors.orange90,
            '& > .MuiAlert-action': {
              svg: {
                color: colors.orange90,
              },
            },
          },
        },
      ],
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: colors.blue90,
        },
      },
      variants: [
        {
          props: { indicatorColor: 'orange' },
          style: {
            '& .MuiButtonBase-root.MuiTab-root.Mui-selected': {
              color: colors.orange90,
            },
            '& .MuiTabs-indicator': {
              backgroundColor: colors.orange90,
            },
          },
        },
      ],
    },
    MuiTab: {
      styleOverrides: {
        root: {
          ...typography.headline4,
          fontFamily: HEADER_FONT_FAMILY,
          textTransform: 'none',
          color: colors.darkBlue70,
          padding: '12px',
          '&.Mui-selected': {
            color: colors.blue90,
          },
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          backgroundColor: colors.blue10,
          padding: '20px',
        },
      },
      defaultProps: {
        connector: <Icon icon="chevron-right" size={20} />,
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        text: ({ theme }) => ({
          ...theme.typography.headline4,
        }),
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        root: {
          cursor: 'pointer',
        },
        label: {
          ...typography.headline4,
          color: colors.grey70,
          '&.Mui-active': {
            fontWeight: 600,
          },
        },
        iconContainer: {
          svg: {
            color: 'transparent',
            text: {
              fill: colors.grey70,
              fontWeight: 600,
            },
            border: `1px solid ${colors.grey70}`,
            borderRadius: '50%',
            '&.Mui-completed': {
              color: colors.grey70,
              border: 'none',
            },
            '&.Mui-active': {
              color: colors.blue90,
              border: 'none',
              text: {
                fill: colors.white,
              },
            },
          },
        },
      },
      variants: [
        {
          props: { color: 'error' },
          style: {
            '.MuiStepLabel-iconContainer': {
              svg: {
                '&.Mui-active': {
                  color: colors.red90,
                },
                ':not(&.Mui-active)': {
                  border: `1px solid ${colors.red90}`,
                  text: {
                    fill: colors.red90,
                  },
                  '&.Mui-completed': {
                    border: 'none',
                  },
                },
              },
            },
          },
        },
      ],
    },
    // NativeSelect Style
    MuiNativeSelect: {
      defaultProps: {
        input: <InputBase />,
        IconComponent: (props) => (
          <Icon
            icon={'chevron-down'}
            size={16}
            sx={{ color: colors.grey90, flex: 'none' }}
            {...props}
          />
        ),
        // Use defaultProps in this case because styles applied to the styleOverrides root are not being applied.
        sx: {
          border: `1px solid ${colors.grey30}`,
          borderRadius: '4px',
          padding: '10px 12px',
          '&.Mui-focused': {
            borderColor: colors.blue90,
            boxShadow: '0px 0px 10px 3px rgba(0, 102, 255, 0.12)',
            borderWidth: '1px',
          },
        },
      },
      styleOverrides: {
        select: {
          ':focus': {
            backgroundColor: '#fff',
          },
        },
      },
    },
    //Select Style
    MuiSelect: {
      defaultProps: {
        IconComponent: (props) => (
          <Icon
            icon={'chevron-down'}
            size={16}
            sx={{
              '&.MuiSelect-icon': {
                color: 'darkBlue.70',
                flexShrink: 0,
              },
            }}
            {...props}
          />
        ),
        MenuProps: {
          sx: {
            mt: 1,
            '&.MuiMenu-root > .MuiPaper-root': {
              maxHeight: '420px',
              minWidth: 'max-content',
            },
          },
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
        },
      },
      variants: [
        {
          props: { variant: 'standard' },
          style: {
            paddingRight: '7px',
            '&.MuiInputBase-root > .MuiSelect-select': {
              ...typography.ellipsis,
              lineHeight: 'initial',
              display: 'flex',
              alignItems: 'center',
            },
          },
        },
      ],
      styleOverrides: {
        select: {
          color: colors.grey90,
          background: 'transparent',
        },
        icon: {
          right: 12,
        },
      },
    },
    MuiAutocomplete: {
      defaultProps: {
        popupIcon: (
          <Icon icon="chevron-down" size={20} sx={{ color: colors.grey90 }} />
        ),
      },
      styleOverrides: {
        input: {
          '&.MuiOutlinedInput-input': {
            padding: '0px 9px',
          },
        },
        paper: {
          paddingBottom: 0,
          overflowX: 'hidden',
          marginTop: '5px',
          width: 'max-content',
          minWidth: '240px',
          '& > .MuiAutocomplete-listbox': {
            width: 'max-content',
            minWidth: '240px',
            paddingBottom: 0,
          },
          '& > .MuiAutocomplete-listbox li': {
            backgroundColor: colors.white,
            minWidth: 'max-content',
            ':hover': {
              backgroundColor: colors.blue5,
              color: colors.blue90,
            },
          },
          '& > .MuiAutocomplete-listbox li[aria-selected="true"]': {
            backgroundColor: `${colors.blue5} !important`,
            color: colors.blue90,
            minWidth: 'max-content',
            ':hover': {
              backgroundColor: colors.blue5,
              color: colors.blue90,
            },
          },
          '& > .MuiAutocomplete-listbox li.Mui-focused': {
            backgroundColor: colors.blue5,
            color: colors.blue90,
            minWidth: 'max-content',
            ':hover': {
              backgroundColor: colors.blue5,
              color: colors.blue90,
            },
          },
          '& > .MuiAutocomplete-listbox li.Mui-focusVisible': {
            backgroundColor: `${colors.blue5} !important`,
            color: colors.blue90,
            minWidth: 'max-content',
            ':hover': {
              backgroundColor: colors.blue5,
              color: colors.blue90,
            },
          },
        },
      },
    },
    MuiCircularProgress: {
      defaultProps: {
        size: 18,
      },
      styleOverrides: {
        colorPrimary: {
          color: colors.blue70,
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          marginLeft: 0,
        },
        label: ({ theme }) => ({
          [`&.${formControlLabelClasses.label}.${formControlLabelClasses.label}`]:
            {
              ...theme.typography.body1,
              color: theme.palette.gray[90],
            },
        }),
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: ({ theme }) => ({
          [`& > .${toggleButtonClasses.root}`]: {
            ...theme.typography.button2,
            backgroundColor: theme.palette.transparent,
            ':hover': {
              backgroundColor: theme.palette.transparent,
            },
            [`&.${toggleButtonClasses.selected}`]: {
              // Combat the negative margin to show the selected border
              zIndex: theme.zIndex.tooltip,
              backgroundColor: theme.palette.transparent,
              ':hover': {
                backgroundColor: theme.palette.transparent,
              },
            },
          },
        }),
      },
      variants: [
        {
          props: { color: 'primary' },
          style: ({ theme }) => ({
            [`&.${toggleButtonGroupClasses.root} .${toggleButtonClasses.root}`]:
              {
                color: theme.palette.gray[90],
                borderColor: theme.palette.gray[30],
                ':hover': {
                  borderColor: theme.palette.gray[70],
                },
                [`&.${toggleButtonClasses.selected}`]: {
                  borderColor: theme.palette.borderSelected,
                  color: theme.palette.contentAccent,
                },
              },
          }),
        },
      ],
    },
  },
});

export default theme;
