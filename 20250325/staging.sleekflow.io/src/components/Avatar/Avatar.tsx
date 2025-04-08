import {
  Avatar as AvatarBase,
  avatarClasses,
  AvatarGroup as AvatarGroupBase,
  Skeleton,
  styled,
  useThemeProps,
} from '@mui/material';
import React from 'react';

import { useFetchImageWithUrl } from '@/api/company';
import Icon from '@/components/Icon';

import {
  AvatarGroupContextValue,
  AvatarGroupOwnerState,
  AvatarGroupProps,
  AvatarOwnerState,
  AvatarProps,
} from './AvatarTypes';

const ENGLISH_ALPHABET_REGEX = /^[a-zA-Z]+$/;

const AVATAR_SIZE_MAP = {
  small: 24,
  medium: 32,
  large: 40,
};

export const AVATAR_SPACING_MAP = {
  small: -4,
  medium: -6,
  large: -6,
};

const AVATAR_HUES = [
  { hue: 148, color: 'forest' },
  { hue: 178, color: 'emerald' },
  { hue: 196, color: 'turquoise' },
  { hue: 230, color: 'navyBlue' },
  { hue: 238, color: 'purple' },
] as const;

export function getInitials(name: string) {
  const firstLetterOfName =
    name && name.length >= 1 ? name[0].toUpperCase() : undefined;
  const isEnglish = firstLetterOfName
    ? ENGLISH_ALPHABET_REGEX.test(firstLetterOfName)
    : undefined;

  if (isEnglish && firstLetterOfName) {
    return firstLetterOfName;
  }

  return undefined;
}

function getAvatarBackgroundColorByName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hueHash = hash % 360;
  const colourDiffs = AVATAR_HUES.map((h) => Math.abs(hueHash - h.hue));
  const closestHue = AVATAR_HUES[colourDiffs.indexOf(Math.min(...colourDiffs))];

  return closestHue.color;
}

const AvatarGroupContext = React.createContext<AvatarGroupContextValue>({});

const useAvatarContext = () => {
  const context = React.useContext(AvatarGroupContext);

  return context;
};

const AvatarGroupRoot = styled(AvatarGroupBase, {
  name: 'SfAvatarGroup',
  slot: 'root',
})<{ ownerState: AvatarGroupOwnerState }>(({ theme, ownerState }) => {
  const total =
    ownerState.total || (ownerState.children as React.ReactElement[])?.length;
  const max = ownerState.max!;
  const isOverMax = total > max;
  return {
    ...(isOverMax && {
      [`& .${avatarClasses.root}:first-of-type`]: {
        ...((ownerState.size === 'small' ||
          ownerState.size === 'medium' ||
          ownerState.size === 'large') && {
          width: `${AVATAR_SIZE_MAP[ownerState.size]}px`,
          height: `${AVATAR_SIZE_MAP[ownerState.size]}px`,
        }),
        ...(typeof ownerState.size === 'number' && {
          width: `${ownerState.size}px`,
          height: `${ownerState.size}px`,
          fontSize: `max(${ownerState.size / 3}px, ${
            theme.typography.button3.fontSize
          })`,
        }),
      },
    }),
  };
});

const AvatarRoot = styled(AvatarBase, {
  name: 'SfAvatar',
  slot: 'root',
  overridesResolver: (styles) => {
    return [styles.root];
  },
})<{ ownerState: AvatarOwnerState }>(({ theme, ownerState }) => ({
  borderRadius: '100px',
  color: theme.palette.white,
  ...(ownerState.color === 'navyBlue' && {
    background: theme.palette.darkBlue[90],
  }),
  ...(ownerState.color === 'emerald' && {
    background: theme.palette.emerald[90],
  }),
  ...(ownerState.color === 'turquoise' && {
    background: theme.palette.turquoise[90],
  }),
  ...(ownerState.color === 'forest' && {
    background: theme.palette.forest[80],
  }),
  ...(ownerState.color === 'purple' && {
    background: theme.palette.purple[80],
  }),
  ...(ownerState.color === 'lightRed' && {
    background: theme.palette.red[5],
    color: theme.palette.red[90],
  }),
  ...((ownerState.size === 'small' ||
    ownerState.size === 'medium' ||
    ownerState.size === 'large') && {
    '& svg': {
      color: 'inherit',
      width: `max(${AVATAR_SIZE_MAP[ownerState.size] / 2}px, 16px)`,
      height: `max(${AVATAR_SIZE_MAP[ownerState.size] / 2}px, 16px)`,
    },
    width: `${AVATAR_SIZE_MAP[ownerState.size]}px`,
    height: `${AVATAR_SIZE_MAP[ownerState.size]}px`,
  }),
  ...(typeof ownerState.size === 'number' && {
    '& svg': {
      color: 'inherit',
      width: `max(${ownerState.size / 2}px, 16px)`,
      height: `max(${ownerState.size / 2}px, 16px)`,
    },
    width: `${ownerState.size}px`,
    height: `${ownerState.size}px`,
    fontSize: `max(${ownerState.size / 3}px, ${
      theme.typography.button3.fontSize
    })`,
  }),
}));

const AvatarFallback = styled('div', {
  name: 'SfAvatar',
  slot: 'fallback',
  overridesResolver: (styles) => {
    return [styles.fallback];
  },
})<{ ownerState: AvatarOwnerState }>(() => ({
  color: 'white',
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& > svg': {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -30%)',
    width: '75% !important',
    height: '75% !important',
  },
}));

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  function Avatar(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: 'SfAvatar' });
    const avatarContext = useAvatarContext();
    const {
      sx,
      loading,
      size: sizeProp = 'medium',
      color: colorProp,
      alt: altProp = '',
      name = '',
      imgProps: imgPropsProp,
      children,
      src: srcProp,
      ...others
    } = props;

    const imageWithUrl = useFetchImageWithUrl({ url: srcProp });
    const src = srcProp?.startsWith(import.meta.env.VITE_API_BASE_URL)
      ? imageWithUrl.data
      : srcProp;

    const size = avatarContext?.size || sizeProp;
    const alt = altProp || name;
    const avatarImageSize =
      typeof size === 'number' ? size : AVATAR_SIZE_MAP[size];
    const imgProps = imgPropsProp || {
      loading: 'lazy',
      width: avatarImageSize,
      height: avatarImageSize,
    };
    const color = colorProp ? colorProp : getAvatarBackgroundColorByName(alt);
    const userInitials = getInitials(alt);
    const ownerState = {
      size,
      color,
      alt,
      max: avatarContext?.max,
      ...others,
    };

    if (loading) {
      return (
        <Skeleton
          variant="circular"
          width={avatarImageSize}
          height={avatarImageSize}
        />
      );
    }

    return (
      <AvatarRoot
        {...others}
        ownerState={ownerState}
        ref={ref}
        imgProps={imgProps}
        sx={sx}
        src={src}
      >
        {children ? (
          children
        ) : userInitials ? (
          userInitials
        ) : (
          <AvatarFallback ownerState={ownerState}>
            <Icon icon="user-solid" />
          </AvatarFallback>
        )}
      </AvatarRoot>
    );
  },
);

export function AvatarGroup(inProps: AvatarGroupProps) {
  const props = useThemeProps({ props: inProps, name: 'SfAvatarGroup' });
  const {
    max = 5,
    children,
    size = 'medium',
    spacing: spacingProp = size,
    ...other
  } = props;
  const spacing =
    spacingProp in AVATAR_SPACING_MAP
      ? AVATAR_SPACING_MAP[spacingProp as keyof typeof AVATAR_SPACING_MAP]
      : spacingProp;

  const total = React.Children.count(children);
  const ownerState = { max, children, spacing, size, total };

  return (
    <AvatarGroupContext.Provider
      value={{
        size,
        total,
        max,
        spacing,
      }}
    >
      <AvatarGroupRoot
        total={total}
        // @ts-expect-error incorrect type for spacing
        spacing={spacing}
        max={max}
        ownerState={ownerState}
        {...other}
      >
        {children}
      </AvatarGroupRoot>
    </AvatarGroupContext.Provider>
  );
}
