import {
  Box,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  TypographyProps,
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, Link } from 'react-router-dom';

import { Avatar as ColoredAvatar } from '@/components/Avatar';
import Icon from '@/components/Icon';
import { ScrollArea } from '@/components/ScrollArea';
import { ROUTES } from '@/constants/navigation';
import { useRouteWithLocale } from '@/hooks/useRouteWithLocale/useRouteWithLocale';

import EmptyResult from './EmptyResult';

interface HighlightedProps extends TypographyProps {
  content: string;
  keyword: string | '';
}
const HighlightedTypography = ({
  content,
  keyword,
  ...props
}: HighlightedProps) => {
  const checkMatchWordRegex = new RegExp(
    `(${keyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`,
    'gi',
  );

  // Split on highlight term and include term into parts, ignore case.
  const getSplitParts = (content: string) => {
    // checking (case-insensitive)
    const isMatch = content.toUpperCase().includes(keyword.toUpperCase());
    if (!keyword || !isMatch) {
      return content;
    }
    const splitParts = content.split(checkMatchWordRegex);
    return splitParts.map((part, idx) => (
      <Box
        component="span"
        key={idx}
        sx={
          part.toLowerCase() === keyword.toLowerCase()
            ? { color: 'darkBlue.90', fontWeight: 600 }
            : {}
        }
      >
        {part}
      </Box>
    ));
  };

  return <Typography {...props}>{getSplitParts(content)}</Typography>;
};

const MenuItemCard = ({
  id,
  conversationId,
  name,
  phoneNumber,
  email,
  onCloseModal,
  keyword,
}: {
  name: string;
  id: string;
  conversationId: string;
  phoneNumber: string;
  email: string;
  onCloseModal: () => void;
  keyword?: string;
}) => {
  const routeTo = useRouteWithLocale();
  const { t } = useTranslation();

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCloseModal();
  };

  return (
    <Stack
      direction="row"
      spacing={2}
      onClick={onCloseModal}
      sx={{
        textDecoration: 'none',
        p: '12px 16px',
        height: '64px',
        alignItems: 'center',
        justifyContent: 'space-between',
        '&:hover': {
          backgroundColor: 'blue.10',
          cursor: 'pointer',
          '#highlight': {
            color: 'blue.90',
          },
        },
      }}
      component={Link}
      to={routeTo(generatePath(ROUTES.contactsId, { id }))}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <ColoredAvatar
          //no staffId for current api
          alt={name}
          name={name ?? ''}
          imgProps={{
            loading: 'lazy',
            width: 32,
            height: 32,
          }}
          sx={{ ml: '14px' }}
        />
        <Stack direction="column">
          <HighlightedTypography
            id="highlight"
            variant="body1"
            sx={{
              color: 'gray.90',
              fontSize: 14,
            }}
            content={name}
            keyword={keyword || ''}
          />
          <HighlightedTypography
            id="highlight"
            variant="body1"
            sx={{
              color: 'gray.90',
              fontSize: 12,
            }}
            content={`${phoneNumber}${
              email && phoneNumber ? ', ' + email : email
            }`}
            keyword={keyword || ''}
          />
        </Stack>
      </Stack>
      <Stack direction="row" spacing={2}>
        <Tooltip
          title={t('inbox.universal-search.tooltip-send-message')}
          placement="bottom"
        >
          <IconButton
            onClick={(e: React.MouseEvent) => stopPropagation(e)}
            aria-label="send-message"
            size="large"
            component={Link}
            to={
              routeTo(ROUTES.inbox) +
              `?threadId=${conversationId}&name=${conversationId}`
            }
          >
            <Icon icon="message-dots-square" size={20} />
          </IconButton>
        </Tooltip>
        <Tooltip
          title={t('inbox.universal-search.tooltip-go-to-contact')}
          placement="bottom"
        >
          <IconButton
            // no need onClick as click list item will have the same action
            aria-label="find-contact"
            size="large"
          >
            <Icon icon="user" size={20} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
};

const SearchResultMenu = ({
  data,
  keyword,
  onCloseModal,
}: {
  data: {
    id: string;
    conversationId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
  }[];
  onCloseModal: () => void;
  keyword?: string;
}) => {
  //data massage
  const SearchResultList =
    data.length > 0
      ? data.map((item) => ({
          ...item,
          email: item.email ?? '',
          name: `${item.firstName ?? ''} ${item.lastName ?? ''}`,
        }))
      : [];

  return data.length > 0 ? (
    <ScrollArea
      sx={(theme) => ({
        // for dynamic height
        height: `calc(64px * ${SearchResultList.length})`,
        maxHeight: '448px',
        borderTop: `1px solid ${theme.palette.gray[30]}`,
      })}
    >
      {SearchResultList.map((item) => (
        <MenuItemCard
          {...item}
          key={item.id}
          keyword={keyword}
          onCloseModal={onCloseModal}
        />
      ))}
    </ScrollArea>
  ) : (
    <EmptyResult />
  );
};

export default SearchResultMenu;
