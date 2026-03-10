import { locale } from 'os-lang-locale';
import { sync as osLocale } from 'os-locale';

/**
 * 同步獲取操作系統語言環境
 * Synchronously get operating system locale
 *
 * @returns 語言環境字串
 */
export function osLocaleSync()
{
	let lang: string;

	try
	{
		lang = locale().replace('-', '_')
	}
	catch (e)
	{
		lang = osLocale()
	}

	return lang
}
