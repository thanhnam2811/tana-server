import app from '@app';
import validateEnv from '@utils/validate-env';
import { Settings } from 'luxon';

Settings.defaultLocale = 'vi';

validateEnv();

app.start();
