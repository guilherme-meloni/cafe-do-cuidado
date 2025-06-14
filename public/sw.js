// public/sw.js

self.addEventListener('push', event => {
  // Pega os dados da notificação que o nosso servidor enviou
  const data = event.data.json();

  // Monta e exibe a notificação na tela do usuário
  const promiseChain = self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon,
    vibrate: [200, 100, 200], // Faz o celular vibrar
  });

  event.waitUntil(promiseChain);
});