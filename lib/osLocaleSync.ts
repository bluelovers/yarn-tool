import { locale } from 'os-lang-locale';
import { sync as osLocale } from 'os-locale';

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
