const urls = [
    'https://zhaoqixian.github.io/',
    'https://zhaoqixian.com/'
];
const timeoutMs = 5 * 60 * 1000;
const retryDelayMs = 15 * 1000;
const deadline = Date.now() + timeoutMs;
let deploymentPassed = false;

async function checkUrl(url) {
    const response = await fetch(url, {
        headers: { 'user-agent': 'zhaoqixian-site-deployment-check' },
        redirect: 'follow'
    });
    const body = await response.text();

    if (!response.ok) {
        throw new Error(`${url} returned HTTP ${response.status}`);
    }
    if (!body.includes('<meta name="description"')) {
        throw new Error(`${url} does not contain the expected site metadata`);
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
