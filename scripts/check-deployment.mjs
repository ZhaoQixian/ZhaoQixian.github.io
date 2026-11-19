const urls = (process.env.DEPLOYMENT_URLS || [
    'https://zhaoqixian.github.io/'
].join(','))
    .split(',')
    .map(url => url.trim())
    .filter(Boolean);
const redirectHost = 'zhaoqixian.com';
const timeoutMs = 5 * 60 * 1000;
const retryDelayMs = 15 * 1000;
const deadline = Date.now() + timeoutMs;
let deploymentPassed = false;

async function checkUrl(url) {
    const response = await fetch(url, {
        headers: { 'user-agent': 'zhaoqixian-site-deployment-check' },
        redirect: 'manual'
    });

    if (response.status !== 301) {
        throw new Error(`${url} returned HTTP ${response.status}, expected 301 redirect to ${redirectHost}`);
    }
    const location = response.headers.get('location');
    const targetHost = location ? new URL(location).hostname : null;
    if (targetHost !== redirectHost) {
        throw new Error(`${url} redirected to ${location}, expected host ${redirectHost}`);
    }
}

while (Date.now() < deadline) {
    try {
        await Promise.all(urls.map(checkUrl));
        deploymentPassed = true;
        break;
    } catch (error) {
        console.log(error.message);
        await new Promise(resolve => setTimeout(resolve, retryDelayMs));
    }
}

if (deploymentPassed) {
    console.log('Deployment checks passed.');
} else {
    console.error('Deployment checks timed out.');
    process.exitCode = 1;
}
