import requestIp, { Request } from 'request-ip';

function checkIPFormat(userIp?: string | null) {
	try {
		return !userIp || userIp === undefined || userIp === null || (String(userIp).indexOf('.') <= -1 && String(userIp).indexOf(':') <= -1);
	} catch (err) {
		return null;
	}
}

export type Config = {
	cloudflare?: boolean;
};

export function detect(req: Request, config?: Config) {
	try {
		let userIp = (config?.cloudflare ? req.headers?.['cf-connecting-ip'] : null) as string | null;
		const rhost = req.headers?.['remote-host'];
		let forwarded = req.headers?.['x-forwarded-for'];
		const real = req.headers?.['x-real-ip'];

		if (rhost) {
			forwarded = forwarded?.replace(new RegExp(', ' + rhost, 'g'), '');
			forwarded = forwarded?.replace(new RegExp(',' + rhost, 'g'), '');
		}

		if (checkIPFormat(userIp)) {
			const hdip = String(forwarded).split(',');
			userIp = hdip[hdip.length - 1] ?? null;
		}

		if (checkIPFormat(userIp)) {
			const hdip2 = String(real).split(',');
			userIp = hdip2[hdip2.length - 1] ?? null;
		}

		if (checkIPFormat(userIp)) {
			userIp = requestIp.getClientIp(req);
		}

		if (checkIPFormat(userIp)) {
			userIp = null;
		}

		if (!checkIPFormat(userIp)) {
			userIp = String(userIp)
				.replace(/::ffff:/g, '')
				.trim();
		}
		return userIp;
	} catch (err) {
		return null;
	}
}
