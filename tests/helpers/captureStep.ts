import { test, type Page } from '@playwright/test';

export async function captureStep<T>(
  page: Page,
  name: string,
  action: () => Promise<T>,
): Promise<T> {
  return test.step(name, async () => {
    const result = await action();
    const attachmentNumber =
      test.info().attachments.filter((attachment) => attachment.name.startsWith('step-screenshot-'))
        .length + 1;
    const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const screenshot = await page.screenshot({ animations: 'disabled' });

    await test.info().attach(`step-screenshot-${attachmentNumber}-${safeName}`, {
      body: screenshot,
      contentType: 'image/png',
    });

    return result;
  });
}
