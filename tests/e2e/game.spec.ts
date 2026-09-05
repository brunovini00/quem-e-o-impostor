import { mkdir } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

const names = ['Lia', 'Caio', 'Bia'];
const screenshotDirectory = process.env.E2E_BASE_URL
  ? 'test-results/deployed-screenshots'
  : 'docs/screenshots';

async function openHome(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Jogar', exact: true })).toBeVisible();
  await expect
    .poll(async () =>
      page.getByRole('button', { name: 'Jogar', exact: true }).evaluate((element) => {
        let opacity = 1;
        let ancestor: Element | null = element;
        while (ancestor) {
          opacity *= Number(getComputedStyle(ancestor).opacity);
          ancestor = ancestor.parentElement;
        }
        return opacity;
      }),
    )
    .toBe(1);
}

async function registerPlayers(page: Page) {
  await page.getByRole('button', { name: 'Jogar', exact: true }).click();
  for (const [index, name] of names.entries()) {
    await page.getByRole('textbox', { name: `Nome do jogador ${index + 1}` }).fill(name);
  }
  await page.getByRole('button', { name: 'Organizar a ordem' }).click();
  await expect(page.getByRole('heading', { name: 'Passe nessa ordem' })).toBeVisible();
}

async function prepareRound(page: Page) {
  await registerPlayers(page);
  await page.getByRole('button', { name: 'Escolher os temas' }).click();
  await page.getByRole('button', { name: 'Revisar partida' }).click();
  await page.getByRole('button', { name: 'Iniciar partida' }).click();
  await expect(page.getByRole('button', { name: `Sou ${names[0]}` })).toBeVisible();
}

async function holdToReveal(page: Page) {
  const hold = page.getByRole('button', { name: 'Segure para revelar seu papel' });
  await hold.scrollIntoViewIfNeeded();
  const box = await hold.boundingBox();
  if (!box) throw new Error('Botão de revelar não está disponível.');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(page.getByTestId('secret-content')).toBeVisible();
}

async function releaseAndConceal(page: Page) {
  await page.mouse.up();
  await expect(page.getByTestId('secret-content')).toHaveCount(0);
}

async function assertNoHorizontalOverflow(page: Page) {
  const overflowing = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    return [...document.querySelectorAll<HTMLElement>('body *')].some((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden' || rect.width === 0)
        return false;
      return rect.right > viewportWidth + 1 || rect.left < -1;
    });
  });
  expect(overflowing).toBe(false);
}

test('fluxo completo: cadastro, ordem, temas, segredo individual, votação e nova rodada', async ({
  page,
}) => {
  const consoleMessages: string[] = [];
  page.on('console', (message) => consoleMessages.push(message.text()));
  await mkdir(screenshotDirectory, { recursive: true });
  await openHome(page);
  await page.screenshot({ path: `${screenshotDirectory}/home.png`, animations: 'disabled' });
  await registerPlayers(page);
  await page.getByRole('button', { name: 'Mover Lia para baixo' }).click();
  await expect(page.getByLabel('Ordem de Lia: 2 de 3')).toBeVisible();

  const handle = page.getByLabel('Ordem de Lia: 2 de 3');
  const destination = page.getByLabel('Ordem de Caio: 1 de 3');
  const from = await handle.boundingBox();
  const to = await destination.boundingBox();
  if (!from || !to) throw new Error('Alça de reordenação indisponível.');
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 12 });
  await page.mouse.up();
  await expect(page.getByLabel('Ordem de Lia: 1 de 3')).toBeVisible();

  await page.getByRole('button', { name: 'Escolher os temas' }).click();
  await page.getByRole('button', { name: 'Limpar seleção de temas' }).click();
  await expect(page.getByRole('button', { name: 'Revisar partida' })).toBeDisabled();
  await page.getByRole('textbox', { name: 'Buscar temas' }).fill('COMIDAS');
  await page.getByRole('checkbox', { name: /^Comidas e pratos,/ }).click();
  await page.getByRole('textbox', { name: 'Buscar temas' }).fill('SERIES');
  await page.getByRole('checkbox', { name: /^Séries e programas de TV,/ }).click();
  await page.getByRole('button', { name: 'Limpar busca' }).click();
  await expect(page.getByText(/2 temas selecionados/)).toBeVisible();
  await page.screenshot({ path: `${screenshotDirectory}/themes.png`, animations: 'disabled' });
  await page.getByRole('button', { name: 'Revisar partida' }).click();
  await expect(page.getByRole('heading', { name: 'Tudo pronto?' })).toBeVisible();
  await page.getByRole('button', { name: 'Iniciar partida' }).click();

  const words: string[] = [];
  let impostor: string | null = null;
  for (const [index, name] of names.entries()) {
    await expect(page.getByTestId('secret-content')).toHaveCount(0);
    await page.getByRole('button', { name: `Sou ${name}` }).click();
    await page.getByRole('button', { name: 'Segure para revelar seu papel' }).click();
    await expect(page.getByTestId('secret-content')).toHaveCount(0);
    await holdToReveal(page);
    const secret = (
      await page.getByTestId('secret-content').getByRole('heading').innerText()
    ).trim();
    if (secret.includes('IMPOSTOR')) {
      expect(impostor).toBeNull();
      impostor = name;
    } else words.push(secret);
    await releaseAndConceal(page);
    await page.getByRole('button', { name: 'Já memorizei · esconder e continuar' }).click();
    await expect(page.getByRole('heading', { name: 'Segredo guardado.' })).toBeVisible();
    await expect(page.getByTestId('secret-content')).toHaveCount(0);
    if (index < names.length - 1)
      await page.getByRole('button', { name: 'Próxima pessoa' }).click();
    else await page.getByRole('button', { name: 'Começar discussão' }).click();
  }
  expect(words).toHaveLength(2);
  expect(words[0]).toBe(words[1]);
  for (const word of words) {
    expect(consoleMessages.some((message) => message.includes(word))).toBe(false);
  }
  expect(impostor).not.toBeNull();
  if (!impostor || !words[0]) throw new Error('Papéis da rodada estão incompletos.');
  await expect(page.getByRole('heading', { name: 'Agora é com vocês.' })).toBeVisible();
  await page.getByRole('button', { name: 'Pausar cronômetro' }).click();
  await expect(page.getByRole('button', { name: 'Retomar cronômetro' })).toBeVisible();
  await page.getByRole('button', { name: 'Registrar um palpite' }).click();
  await page.getByRole('radio', { name: impostor, exact: true }).click();
  await page.getByRole('button', { name: 'Revelar resultado', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Acabou o disfarce?' })).toBeVisible();
  await expect(page.getByText('A PALAVRA SECRETA')).toHaveCount(0);
  await page.getByRole('button', { name: 'Sim, revelar resultado' }).click();
  await expect(page.getByRole('heading', { name: 'Fim do disfarce.' })).toBeVisible();
  await expect(page.getByText(words[0], { exact: true })).toBeVisible();
  await expect(page.getByText('O grupo acertou!', { exact: true })).toBeVisible();
  await page.screenshot({ path: `${screenshotDirectory}/result.png`, animations: 'disabled' });
  await page.getByRole('button', { name: 'Jogar novamente', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sou Lia' })).toBeVisible();
  await expect(page.getByTestId('secret-content')).toHaveCount(0);
  await page.getByRole('button', { name: 'Voltar', exact: true }).click();
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sou Lia' })).toBeVisible();
  await page.getByRole('button', { name: 'Voltar', exact: true }).click();
  await page.getByRole('button', { name: 'Sair da rodada', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Jogar', exact: true })).toBeVisible();

  await page.reload();
  await page.getByRole('button', { name: 'Jogar', exact: true }).click();
  for (const [index, name] of names.entries()) {
    await expect(page.getByRole('textbox', { name: `Nome do jogador ${index + 1}` })).toHaveValue(
      name,
    );
  }
});

test('protege o segredo ao perder foco e ao ocultar o navegador, sem restaurar a revelação', async ({
  page,
}) => {
  await openHome(page);
  await prepareRound(page);
  await page.getByRole('button', { name: 'Sou Lia' }).click();
  await holdToReveal(page);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.getByRole('heading', { name: 'Conteúdo protegido' })).toBeVisible();
  await expect(page.getByTestId('secret-content')).toHaveCount(0);
  await page.mouse.up();
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByRole('button', { name: 'Segure para revelar seu papel' })).toBeVisible();
  await expect(page.getByTestId('secret-content')).toHaveCount(0);

  await page.getByRole('button', { name: 'Revelar com confirmação' }).click();
  await page.getByRole('button', { name: 'Mostrar meu papel' }).click();
  await expect(page.getByTestId('secret-content')).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.getByTestId('secret-content')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Conteúdo protegido' })).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.getByRole('button', { name: 'Segure para revelar seu papel' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Jogar', exact: true })).toBeVisible();
  await expect(page.getByTestId('secret-content')).toHaveCount(0);
});

test('320px: telas sem vazamento horizontal, temas claro/escuro e preferência persistida', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await openHome(page);
  await assertNoHorizontalOverflow(page);
  await page.getByRole('button', { name: 'Configurações', exact: true }).click();
  await expect(page.getByRole('radio', { name: 'Escuro', exact: true })).toBeChecked();
  await assertNoHorizontalOverflow(page);
  await page.getByRole('radio', { name: 'Claro', exact: true }).click();
  await expect(page.getByRole('radio', { name: 'Claro', exact: true })).toBeChecked();
  await assertNoHorizontalOverflow(page);
  await page.reload();
  await page.getByRole('button', { name: 'Configurações', exact: true }).click();
  await expect(page.getByRole('radio', { name: 'Claro', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Voltar', exact: true }).click();
  await registerPlayers(page);
  await assertNoHorizontalOverflow(page);
  await page.getByRole('button', { name: 'Escolher os temas' }).click();
  await assertNoHorizontalOverflow(page);
  await page.getByRole('button', { name: 'Revisar partida' }).click();
  await assertNoHorizontalOverflow(page);
});

test('preserva rascunhos ao voltar/recarregar e Escape fecha apenas a confirmação atual', async ({
  page,
}) => {
  await openHome(page);
  await page.getByRole('button', { name: 'Jogar', exact: true }).click();
  await page.getByRole('textbox', { name: 'Nome do jogador 1' }).fill('Lia');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Jogar', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Jogar', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Nome do jogador 1' })).toHaveValue('Lia');
  await expect(page.getByRole('textbox', { name: 'Nome do jogador 2' })).toHaveValue('');
  await page.getByRole('textbox', { name: 'Nome do jogador 2' }).fill('LIA');
  await page.getByRole('button', { name: 'Organizar a ordem' }).click();
  await expect(page.getByText('Esse nome já está na lista. Use um apelido diferente.')).toHaveCount(
    2,
  );
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Jogar', exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Jogar', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Nome do jogador 1' })).toHaveValue('Lia');
  await expect(page.getByRole('textbox', { name: 'Nome do jogador 2' })).toHaveValue('LIA');
  await page.getByRole('textbox', { name: 'Nome do jogador 2' }).fill('Caio');
  await page.getByRole('textbox', { name: 'Nome do jogador 3' }).fill('Bia');
  await page.getByRole('button', { name: 'Organizar a ordem' }).click();
  await page.getByRole('button', { name: 'Escolher os temas' }).click();
  await page.getByRole('button', { name: 'Revisar partida' }).click();
  await page.getByRole('button', { name: 'Iniciar partida' }).click();
  await page.getByRole('button', { name: 'Sou Lia' }).click();
  await page.getByRole('button', { name: 'Revelar com confirmação' }).click();
  await expect(page.getByRole('heading', { name: 'Pronto para olhar?' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Pronto para olhar?' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Sair desta rodada?' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Segure para revelar seu papel' })).toBeVisible();
  await expect(page.getByTestId('secret-content')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Sair desta rodada?' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Sair desta rodada?' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Segure para revelar seu papel' })).toBeVisible();
});
