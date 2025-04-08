import { LocalizationProvider as MuiLocalizationProvider } from '@mui/x-date-pickers';
import { LocalizationProvider as LocalizationProviderPro } from '@mui/x-date-pickers-pro';
import { AdapterDayjs as ProAdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export default function LocalizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MuiLocalizationProvider dateAdapter={AdapterDayjs}>
      <LocalizationProviderPro dateAdapter={ProAdapterDayjs}>
        {children}
      </LocalizationProviderPro>
    </MuiLocalizationProvider>
  );
}
