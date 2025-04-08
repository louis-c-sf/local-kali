import { Box, Button, Tooltip, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from 'react-use';

import { useMyProfile } from '@/hooks/useMyProfile';

import Icon from '../Icon';
import CheckList from './CheckList';

export const GuideButton = () => {
  const { t } = useTranslation();
  const { data: profileData } = useMyProfile();
  const { roleType: role, userInfo } = profileData || {};
  const userId = userInfo?.id;
  const [openList, setOpenList] = useState(false);
  const [isFirstTimeLoginVal, setIsFirstTimeLoginVal] =
    useLocalStorage<boolean>(`isFirstTimeLogin_${userId}`, true);
  const isFirstTimeLogin = useRef(isFirstTimeLoginVal);
  const isTooltipVisible =
    role === 'Admin' && isFirstTimeLogin.current === true;
  const isGuideButtonVisible = role === 'Admin';
  const [openTooltip, setOpenTooltip] = useState(isTooltipVisible);

  const handleDismiss = () => {
    setOpenTooltip(false);
  };

  useEffect(() => {
    if (isFirstTimeLogin.current) {
      setIsFirstTimeLoginVal(false);
    }
  }, [setIsFirstTimeLoginVal]);

  if (!isGuideButtonVisible) {
    return null;
  }

  return (
    <>
      <Tooltip
        open={openTooltip}
        title={
          <Box>
            <Typography
              variant="body1"
              sx={{ fontSize: '14px', fontWeight: '600', color: 'white' }}
            >
              {t('setupGuide.tooltip.title', {
                defaultValue: 'Setup guides',
              })}
            </Typography>
            <Box sx={{ fontSize: '12px' }}>
              {t('setupGuide.tooltip.description', {
                defaultValue:
                  'Check out our guides for assistance with setting up the platform',
              })}
            </Box>
            <Box
              sx={{
                textAlign: 'right',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
              }}
              onClick={handleDismiss}
            >
              {t('setupGuide.tooltip.dismiss', {
                defaultValue: 'Dismiss',
              })}
            </Box>
          </Box>
        }
        placement="bottom-start"
        arrow
      >
        <Button
          onClick={() => {
            setOpenList(true);
            handleDismiss();
          }}
          sx={{ fontSize: '14px' }}
        >
          <Icon
            icon="rocket"
            size={20}
            sx={{ color: 'darkBlue.70', marginRight: '10px' }}
          />
          {t('setupGuide.title', {
            defaultValue: 'Setup guides',
          })}
        </Button>
      </Tooltip>
      {openList && <CheckList onClose={() => setOpenList(false)} />}
    </>
  );
};
