import {
  Avatar,
  Box,
  styled,
  SxProps,
  Theme,
  useThemeProps,
} from '@mui/material';
import React, { createElement, CSSProperties, SVGProps } from 'react';
import { IconProps as IcoMoonProps } from 'react-icomoon';

import { IconNames } from '@/assets/icomoon/icon';
import iconSet from '@/assets/icomoon/selection.json';

const cdnUrl = import.meta.env.VITE_CDN_BASE_URL;

const CHANNEL_ICONS = {
  whatsapp: `${cdnUrl}/channels/whatsapp.svg`,
  whatsapp360dialog: `${cdnUrl}/channels/whatsapp.svg`,
  whatsappcloudapi: `${cdnUrl}/channels/whatsapp.svg`,
  twilio_whatsapp: `${cdnUrl}/channels/whatsapp.svg`,
  messenger: `${cdnUrl}/channels/messenger.svg`,
  instagram: `${cdnUrl}/channels/instagram.svg`,
  viber: `${cdnUrl}/channels/viber.svg`,
  line: `${cdnUrl}/channels/line.svg`,
  wechat: `${cdnUrl}/channels/wechat.svg`,
  web: `${cdnUrl}/channels/livechat.svg`,
  sms: `${cdnUrl}/channels/sms.svg`,
  facebook: `${cdnUrl}/channels/facebook.svg`,
  zapier: '',
  sleekflowApi: '',
  googleSheet: '',
  woocommerce: '',
  shopline: '',
  calendly: '',
  make: '',
  facebookLeadAds: `${cdnUrl}/channels/facebook.svg`,
  telegram: `${cdnUrl}/channels/telegram.svg`,
  salesforce: `${cdnUrl}/channels/salesforce.svg`,
  stripe: `${cdnUrl}/channels/stripe.svg`,
  hubspot: `${cdnUrl}/channels/hubspot.svg`,
  shopify: `${cdnUrl}/channels/shopify.svg`,
  'play-circle': `${cdnUrl}/media/play-circle.svg`,
  livechat: `${cdnUrl}/channels/livechat.svg`,
  note: 'notification-text',
  zoho: `${cdnUrl}/channels/zoho.svg`,
};

type IconSetItem = {
  properties: {
    name: string;
  };
  icon: {
    paths: string[];
    attrs?: Record<string, unknown>[];
    width?: number | string;
  };
};

type IconSet = {
  icons: IconSetItem[];
};

const ICON_SIZE_MAPPING = {
  'x-small': 16,
  small: 20,
  medium: 28,
  large: 32,
  'x-large': 40,
};

export type IconProps = Omit<
  IcoMoonProps,
  'color' | 'icon' | 'size' | keyof SVGProps<SVGElement>
> &
  React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > & {
    variant?: 'standard' | 'outlined';
    ref?: React.Ref<HTMLDivElement>;
    icon: IconNames | keyof typeof CHANNEL_ICONS;
    sx?: SxProps<Theme>;
    size?:
      | number
      | 'x-small'
      | 'small'
      | 'medium'
      | 'large'
      | 'x-large'
      | string;
  };
export type IconPropsOwnerState = IconProps;

// copied from Icomoon package - need to extract IcoMoonBase from package in order to forward ref as the package author did not do this
const IcoMoonBase = React.forwardRef(function IcoMoonBase(
  {
    iconSet,
    icon,
    size,
    title,
    disableFill,
    removeInlineStyle,
    native,
    SvgComponent,
    PathComponent,
    ...props
  }: IcoMoonProps & {
    iconSet: IconSet;
  },
  ref,
) {
  if (!iconSet || !icon) return null;

  const currentIcon = iconSet.icons.find(
    (item) => item.properties.name === icon,
  );

  if (!currentIcon) return null;

  const initialStyle: CSSProperties = {
    display: 'inline-block',
    stroke: 'currentColor',
    fill: 'currentColor',
  };

  if (native) {
    initialStyle.display = 'flex';
    initialStyle.flexDirection = 'row';
    initialStyle.flexWrap = 'wrap';
  }

  const comptuedStyle = {
    ...(removeInlineStyle ? {} : initialStyle),
    ...(size ? { width: size, height: size } : {}),
    ...(props.style || {}),
  };

  const { width = '1024' } = currentIcon.icon;

  const viewBox = `0 0 ${width} 1024`;

  const children = currentIcon.icon.paths.map((path, index) => {
    const attrs = currentIcon.icon.attrs?.[index];

    const pathProps = {
      d: path,
      key: icon + index,
      ...(!disableFill && attrs ? attrs : {}),
    };

    return createElement(PathComponent || 'path', pathProps);
  });

  if (title && !native) {
    children.push(createElement('title', { key: title }, title));
  }

  return createElement(
    SvgComponent || 'svg',
    { ...props, viewBox, style: comptuedStyle, ref },
    children,
  );
});

const IcoMoonIconRoot = styled(IcoMoonBase, {
  name: 'SfIcon',
  slot: 'icomoonRoot',
})<{ ownerState: IconPropsOwnerState }>(({ ownerState }) => ({
  ...(typeof ownerState.size === 'number' && {
    width: `${ownerState.size}px`,
    height: `${ownerState.size}px`,
  }),
  ...(typeof ownerState.size === 'string' && {
    width: ownerState.size,
    height: ownerState.size,
    ...((ownerState.size === 'x-small' ||
      ownerState.size === 'small' ||
      ownerState.size === 'medium' ||
      ownerState.size === 'large' ||
      ownerState.size === 'x-large') && {
      width: `${ICON_SIZE_MAPPING[ownerState.size]}px`,
      height: `${ICON_SIZE_MAPPING[ownerState.size]}px`,
    }),
  }),
  ...(ownerState.variant === 'outlined' && {
    padding: '3px',
  }),
}));

const ImageIconRoot = styled(Avatar, {
  name: 'SfIcon',
  slot: 'imageRoot',
})<{ ownerState: IconPropsOwnerState }>(({ ownerState }) => ({ theme }) => ({
  userSelect: 'none',
  ...(typeof ownerState.size === 'number' && {
    width: `${ownerState.size}px`,
    height: `${ownerState.size}px`,
  }),
  ...(typeof ownerState.size === 'string' && {
    width: ownerState.size,
    height: ownerState.size,
    ...((ownerState.size === 'x-small' ||
      ownerState.size === 'small' ||
      ownerState.size === 'medium' ||
      ownerState.size === 'large' ||
      ownerState.size === 'x-large') && {
      width: `${ICON_SIZE_MAPPING[ownerState.size]}px`,
      height: `${ICON_SIZE_MAPPING[ownerState.size]}px`,
    }),
  }),
  ...(ownerState.variant === 'outlined' && {
    border: '1px solid',
    borderColor: theme.palette.gray[30],
    padding: '1px',
  }),
}));

const Icon = React.forwardRef(function Icon(inProps: IconProps, ref: any) {
  const props = useThemeProps({
    props: inProps,
    name: 'SfIcon',
  });
  const {
    variant = 'standard',
    size = 'small',
    sx,
    icon,
    title,
    disableFill,
    removeInlineStyle,
    native,
    SvgComponent,
    PathComponent,
    ...other
  } = props;
  const ownerState = {
    variant,
    size,
    icon,
    title,
    disableFill,
    removeInlineStyle,
    native,
    SvgComponent,
    PathComponent,
    sx,
    ...other,
  };
  if (
    props.icon in CHANNEL_ICONS &&
    CHANNEL_ICONS[props.icon as keyof typeof CHANNEL_ICONS].includes(cdnUrl)
  ) {
    const src = CHANNEL_ICONS[props.icon as keyof typeof CHANNEL_ICONS];

    return (
      <ImageIconRoot
        ref={ref}
        ownerState={ownerState}
        src={src}
        alt={icon}
        sx={sx}
        {...other}
      />
    );
  }
  if (variant === 'outlined') {
    return (
      <Box
        sx={{
          border: '1px solid',
          borderColor: (theme) => theme.palette.gray[30],
          borderRadius: 999,
          display: 'flex',
          overflow: 'hidden',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* @ts-expect-error incorrect type*/}
        <IcoMoonIconRoot
          sx={sx}
          ownerState={ownerState}
          iconSet={iconSet}
          icon={
            icon in CHANNEL_ICONS
              ? CHANNEL_ICONS[icon as keyof typeof CHANNEL_ICONS]
              : icon
          }
          title={title}
          disableFill={disableFill}
          removeInlineStyle={removeInlineStyle}
          native={native}
          SvgComponent={SvgComponent}
          PathComponent={PathComponent}
          ref={ref}
          {...other}
        />
      </Box>
    );
  }

  return (
    // @ts-expect-error incorrect type
    <IcoMoonIconRoot
      sx={sx}
      ownerState={ownerState}
      iconSet={iconSet}
      icon={
        icon in CHANNEL_ICONS
          ? CHANNEL_ICONS[icon as keyof typeof CHANNEL_ICONS]
          : icon
      }
      title={title}
      disableFill={disableFill}
      removeInlineStyle={removeInlineStyle}
      native={native}
      SvgComponent={SvgComponent}
      PathComponent={PathComponent}
      ref={ref}
      {...other}
    />
  );
});

export default Icon;
