import type { Locale } from '../i18n/types'

type Block = { kind: 'p'; text: string } | { kind: 'ul'; items: string[] }

type Chapter = {
  title: string
  blocks: Block[]
}

export type LegalCopy = {
  pageTitle: string
  privacyTitle: string
  privacyIntro: string
  privacy: Chapter[]
  termsTitle: string
  termsIntro: string
  terms: Chapter[]
  contact: string
}

const pt: LegalCopy = {
  pageTitle: 'Termos e privacidade',
  privacyTitle: 'Política de Privacidade',
  privacyIntro:
    'A proteção dos seus dados é um compromisso do TomzBoost, software de otimização de performance para jogos em computadores com Windows. Esta política explica como o programa trata informações durante o uso e como o site trata os dados da compra. Agimos em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD – Lei nº 13.709/2018).',
  privacy: [
    {
      title: '1. Escopo',
      blocks: [
        {
          kind: 'p',
          text: 'Esta política cobre o software TomzBoost e o site em que a licença é comprada, inclusive o checkout. Também vale para os canais oficiais de suporte indicados no rodapé.',
        },
      ],
    },
    {
      title: '2. Princípios da LGPD',
      blocks: [
        {
          kind: 'ul',
          items: [
            'Necessidade: só o mínimo para executar a otimização ou concluir a compra.',
            'Finalidade: entregar a licença, o suporte e a performance durante o uso do programa.',
            'Transparência: você é informado de forma direta sobre o que é tratado.',
            'Segurança: os dados técnicos do programa não são gravados nem expostos.',
            'Eliminação: o que o programa lê em tempo real é descartado ao encerrar.',
          ],
        },
      ],
    },
    {
      title: '3. Dados técnicos do programa',
      blocks: [
        {
          kind: 'p',
          text: 'Durante o uso, o TomzBoost pode acessar informações do ambiente do computador:',
        },
        {
          kind: 'ul',
          items: [
            'Versão do Windows.',
            'Informações de CPU, GPU, memória RAM e disco.',
            'Estado de serviços e processos ativos.',
            'Configurações de energia, rede, gráfico e multitarefa.',
            'Parâmetros usados pelo sistema para controle de performance.',
          ],
        },
        {
          kind: 'p',
          text: 'Esses dados servem só em tempo real para aplicar as otimizações. Não são gravados, exportados, enviados, compartilhados nem armazenados.',
        },
      ],
    },
    {
      title: '4. O que o aplicativo não faz',
      blocks: [
        {
          kind: 'ul',
          items: [
            'Não pede nome, e-mail, CPF, telefone nem dado pessoal sensível dentro do programa.',
            'Não cria logs permanentes de uso.',
            'Não envia esse ambiente técnico a servidores externos.',
            'Não compartilha esses dados com terceiros.',
            'Não usa cookies, scripts remotos, trackers nem módulos de monitoramento.',
          ],
        },
      ],
    },
    {
      title: '5. Tratamento local e temporário',
      blocks: [
        {
          kind: 'p',
          text: 'A leitura técnica acontece só enquanto o programa está aberto. Ao encerrar o TomzBoost, o que foi processado sai da memória. Não há banco de dados, cache, histórico nem arquivo dessa leitura.',
        },
      ],
    },
    {
      title: '6. Segurança do uso',
      blocks: [
        {
          kind: 'ul',
          items: [
            'Não usa CMD, PowerShell nem regedit.',
            'Não altera nem inclui arquivos dos jogos. Por isso não gera banimento de anti-cheat.',
            'Não faz alteração irreversível no sistema.',
            'A otimização pode ser revertida reiniciando o computador, se você quiser.',
          ],
        },
      ],
    },
    {
      title: '7. Dados do site e do pagamento',
      blocks: [
        {
          kind: 'p',
          text: 'No checkout do site pedimos nome, e-mail, telefone e documento. Usamos esses dados para identificar o pedido, entregar a chave da licença e falar com você sobre o pagamento ou o suporte.',
        },
        {
          kind: 'p',
          text: 'O pagamento é processado pela BuckPay, um fornecedor externo. Os dados necessários para gerar a cobrança são enviados a esse fornecedor. O TomzBoost não opera o gateway de pagamento.',
        },
      ],
    },
    {
      title: '8. Direitos do titular',
      blocks: [
        {
          kind: 'p',
          text: 'Você pode pedir confirmação e transparência sobre o tratamento, e proteção contra uso indevido. Se no futuro uma função nova precisar de dado pessoal dentro do programa, avisamos antes e pedimos consentimento, como exige a lei.',
        },
      ],
    },
    {
      title: '9. Alterações',
      blocks: [
        {
          kind: 'p',
          text: 'Esta política pode ser atualizada se o TomzBoost ou o site passarem a tratar dados de outro jeito. A mudança fica publicada nesta página.',
        },
      ],
    },
  ],
  termsTitle: 'Termos de Uso',
  termsIntro:
    'Bem-vindo ao TomzBoost. Ao comprar a licença e instalar o programa, você declara que leu, entendeu e aceita estes Termos de Uso e a Política de Privacidade.',
  terms: [
    {
      title: '1. Objeto',
      blocks: [
        {
          kind: 'p',
          text: 'Estes termos regulam o uso do TomzBoost, software de otimização de desempenho para jogos em Windows. O programa faz ajustes técnicos no sistema para melhorar o desempenho, sem alterar jogos nem arquivos de terceiros.',
        },
      ],
    },
    {
      title: '2. Aceitação',
      blocks: [
        {
          kind: 'p',
          text: 'Ao comprar a licença, você confirma que leu e concorda com estes termos e com a política de privacidade, reconhece que recebeu uma licença não exclusiva e intransferível, e aceita que o uso é por sua conta e risco, dentro da lei e das funções disponíveis.',
        },
      ],
    },
    {
      title: '3. Licença',
      blocks: [
        {
          kind: 'p',
          text: 'A licença é pessoal e intransferível. Não é comercial, salvo autorização prévia e por escrito. É uma assinatura: inclui o uso do software e as próximas atualizações, pelo prazo da compra (tempo determinado ou vitalícia, conforme o que foi adquirido).',
        },
        {
          kind: 'p',
          text: 'Compartilhar a licença sem autorização pode bloquear a chave, sem reembolso.',
        },
      ],
    },
    {
      title: '4. Segurança e integridade',
      blocks: [
        {
          kind: 'p',
          text: 'O TomzBoost é feito para uso em jogos protegidos por anti-cheat, como VAC, Easy Anti-Cheat, BattleEye e Vanguard. Não altera arquivo de jogo, executável, DLL nem recurso de terceiros. Atua no Windows: prioridade de processos, agendamento, desativação temporária de serviços não essenciais e configurações de desempenho. Não causa banimento em plataforma ou jogo.',
        },
      ],
    },
    {
      title: '5. Propriedade intelectual',
      blocks: [
        {
          kind: 'p',
          text: 'O software, a marca, a identidade visual, o nome, o código-fonte, a interface e os demais elementos do TomzBoost pertencem aos seus desenvolvedores. É proibido copiar, modificar, desmontar, fazer engenharia reversa ou distribuir o software sem autorização prévia e por escrito.',
        },
      ],
    },
    {
      title: '6. Atualizações e suporte',
      blocks: [
        {
          kind: 'p',
          text: 'O TomzBoost pode receber atualizações para desempenho, compatibilidade com novas versões do Windows ou funções novas. O suporte é feito pelos canais oficiais informados nesta página.',
        },
      ],
    },
    {
      title: '7. Limitações de responsabilidade',
      blocks: [
        {
          kind: 'ul',
          items: [
            'O uso é por sua conta e risco.',
            'O ganho de performance varia conforme o hardware, a versão do Windows e outros fatores.',
            'Não respondemos por dano indireto, acidental ou consequente de uso incorreto ou incompatível.',
          ],
        },
      ],
    },
    {
      title: '8. Venda, entrega e reembolso',
      blocks: [
        {
          kind: 'p',
          text: 'A licença é uma assinatura sujeita às próximas atualizações. Ao confirmar o pagamento, uma chave única é liberada. Essa chave já foi emitida mesmo que você ainda não a ative, e não será gerada outra igual.',
        },
        {
          kind: 'p',
          text: 'O artigo 49 do Código de Defesa do Consumidor prevê arrependimento de 7 dias em compras fora de loja física. Esse prazo não alcança conteúdo digital entregue na hora, que não pode ser devolvido depois que o acesso foi liberado. Por isso não há reembolso por insatisfação com o resultado, por incompatibilidade com o seu hardware nem pelo fato de a chave ainda não ter sido ativada.',
        },
        {
          kind: 'p',
          text: 'Abrir chargeback ou disputa suspende na hora a licença e o atendimento, até a disputa terminar. O acesso não continua enquanto o pagamento estiver contestado.',
        },
      ],
    },
    {
      title: '9. Alterações destes termos',
      blocks: [
        {
          kind: 'p',
          text: 'Estes termos podem ser atualizados. A versão vigente fica nesta página. O uso contínuo do software depois de uma mudança relevante representa aceitação das novas condições.',
        },
      ],
    },
  ],
  contact: 'Dúvidas sobre esta página ou sobre o programa: fale pelos canais oficiais.',
}

const es: LegalCopy = {
  pageTitle: 'Términos y privacidad',
  privacyTitle: 'Política de Privacidad',
  privacyIntro:
    'Proteger tus datos es un compromiso de TomzBoost, software de optimización de rendimiento para juegos en Windows. Esta política explica cómo el programa trata la información durante el uso y cómo el sitio trata los datos de la compra. Actuamos conforme a la Ley General de Protección de Datos de Brasil (LGPD – Ley nº 13.709/2018).',
  privacy: [
    {
      title: '1. Alcance',
      blocks: [
        {
          kind: 'p',
          text: 'Esta política cubre el software TomzBoost y el sitio donde se compra la licencia, incluido el checkout. También vale para los canales oficiales de soporte del pie de página.',
        },
      ],
    },
    {
      title: '2. Principios de la LGPD',
      blocks: [
        {
          kind: 'ul',
          items: [
            'Necesidad: solo lo mínimo para ejecutar la optimización o cerrar la compra.',
            'Finalidad: entregar la licencia, el soporte y el rendimiento mientras el programa está en uso.',
            'Transparencia: se informa de forma directa qué se trata.',
            'Seguridad: los datos técnicos del programa no se guardan ni se exponen.',
            'Eliminación: lo que el programa lee en tiempo real se descarta al cerrarlo.',
          ],
        },
      ],
    },
    {
      title: '3. Datos técnicos del programa',
      blocks: [
        { kind: 'p', text: 'Durante el uso, TomzBoost puede acceder a información del equipo:' },
        {
          kind: 'ul',
          items: [
            'Versión de Windows.',
            'Información de CPU, GPU, memoria RAM y disco.',
            'Estado de servicios y procesos activos.',
            'Configuración de energía, red, gráficos y multitarea.',
            'Parámetros que el sistema usa para controlar el rendimiento.',
          ],
        },
        {
          kind: 'p',
          text: 'Esos datos sirven solo en tiempo real para aplicar las optimizaciones. No se graban, exportan, envían, comparten ni almacenan.',
        },
      ],
    },
    {
      title: '4. Qué no hace la aplicación',
      blocks: [
        {
          kind: 'ul',
          items: [
            'No pide nombre, email, CPF, teléfono ni dato personal sensible dentro del programa.',
            'No crea registros permanentes de uso.',
            'No envía ese entorno técnico a servidores externos.',
            'No comparte esos datos con terceros.',
            'No usa cookies, scripts remotos, trackers ni módulos de monitoreo.',
          ],
        },
      ],
    },
    {
      title: '5. Tratamiento local y temporario',
      blocks: [
        {
          kind: 'p',
          text: 'La lectura técnica ocurre solo mientras el programa está abierto. Al cerrar TomzBoost, lo procesado sale de la memoria. No hay base de datos, caché, historial ni archivo de esa lectura.',
        },
      ],
    },
    {
      title: '6. Seguridad de uso',
      blocks: [
        {
          kind: 'ul',
          items: [
            'No usa CMD, PowerShell ni regedit.',
            'No modifica ni agrega archivos de los juegos. Por eso no genera baneos de anti-cheat.',
            'No hace cambios irreversibles en el sistema.',
            'La optimización se puede revertir reiniciando la computadora, si querés.',
          ],
        },
      ],
    },
    {
      title: '7. Datos del sitio y del pago',
      blocks: [
        {
          kind: 'p',
          text: 'En el checkout del sitio pedimos nombre, email, teléfono y documento. Los usamos para identificar el pedido, entregar la clave de la licencia y hablarte del pago o del soporte.',
        },
        {
          kind: 'p',
          text: 'El pago lo procesa BuckPay, un proveedor externo. Los datos necesarios para generar el cobro se envían a ese proveedor. TomzBoost no opera la pasarela de pago.',
        },
      ],
    },
    {
      title: '8. Derechos del titular',
      blocks: [
        {
          kind: 'p',
          text: 'Podés pedir confirmación y transparencia sobre el tratamiento, y protección contra un uso indebido. Si en el futuro una función nueva necesita un dato personal dentro del programa, avisamos antes y pedimos consentimiento, como exige la ley.',
        },
      ],
    },
    {
      title: '9. Cambios',
      blocks: [
        {
          kind: 'p',
          text: 'Esta política puede actualizarse si TomzBoost o el sitio pasan a tratar datos de otra forma. El cambio queda publicado en esta página.',
        },
      ],
    },
  ],
  termsTitle: 'Términos de Uso',
  termsIntro:
    'Bienvenido a TomzBoost. Al comprar la licencia e instalar el programa, declarás que leíste, entendiste y aceptás estos Términos de Uso y la Política de Privacidad.',
  terms: [
    {
      title: '1. Objeto',
      blocks: [
        {
          kind: 'p',
          text: 'Estos términos regulan el uso de TomzBoost, software de optimización de rendimiento para juegos en Windows. El programa hace ajustes técnicos en el sistema para mejorar el desempeño, sin modificar juegos ni archivos de terceros.',
        },
      ],
    },
    {
      title: '2. Aceptación',
      blocks: [
        {
          kind: 'p',
          text: 'Al comprar la licencia confirmás que leíste y aceptás estos términos y la política de privacidad, que recibís una licencia no exclusiva e intransferible, y que el uso es bajo tu responsabilidad, dentro de la ley y de las funciones disponibles.',
        },
      ],
    },
    {
      title: '3. Licencia',
      blocks: [
        {
          kind: 'p',
          text: 'La licencia es personal e intransferible. No es comercial, salvo autorización previa y por escrito. Es una suscripción: incluye el uso del software y las próximas actualizaciones, por el plazo de la compra (tiempo determinado o vitalicia, según lo adquirido).',
        },
        { kind: 'p', text: 'Compartir la licencia sin autorización puede bloquear la clave, sin reembolso.' },
      ],
    },
    {
      title: '4. Seguridad e integridad',
      blocks: [
        {
          kind: 'p',
          text: 'TomzBoost está pensado para juegos protegidos por anti-cheat, como VAC, Easy Anti-Cheat, BattleEye y Vanguard. No modifica archivos del juego, ejecutables, DLL ni recursos de terceros. Actúa en Windows: prioridad de procesos, programación, desactivación temporaria de servicios no esenciales y ajustes de rendimiento. No causa baneos en plataformas ni juegos.',
        },
      ],
    },
    {
      title: '5. Propiedad intelectual',
      blocks: [
        {
          kind: 'p',
          text: 'El software, la marca, la identidad visual, el nombre, el código fuente, la interfaz y los demás elementos de TomzBoost pertenecen a sus desarrolladores. Está prohibido copiar, modificar, desarmar, hacer ingeniería inversa o distribuir el software sin autorización previa y por escrito.',
        },
      ],
    },
    {
      title: '6. Actualizaciones y soporte',
      blocks: [
        {
          kind: 'p',
          text: 'TomzBoost puede recibir actualizaciones de rendimiento, compatibilidad con nuevas versiones de Windows o funciones nuevas. El soporte se hace por los canales oficiales de esta página.',
        },
      ],
    },
    {
      title: '7. Límites de responsabilidad',
      blocks: [
        {
          kind: 'ul',
          items: [
            'El uso es bajo tu responsabilidad.',
            'La ganancia de rendimiento varía según el hardware, la versión de Windows y otros factores.',
            'No respondemos por daño indirecto, accidental o consecuente de un uso incorrecto o incompatible.',
          ],
        },
      ],
    },
    {
      title: '8. Venta, entrega y reembolso',
      blocks: [
        {
          kind: 'p',
          text: 'La licencia es una suscripción sujeta a las próximas actualizaciones. Al confirmar el pago se libera una clave única. Esa clave ya quedó emitida aunque todavía no la actives, y no se genera otra igual.',
        },
        {
          kind: 'p',
          text: 'El artículo 49 del Código de Defensa del Consumidor prevé arrepentimiento de 7 días en compras fuera de una tienda física. Ese plazo no alcanza a un contenido digital entregado al instante, que no se puede devolver una vez liberado el acceso. Por eso no hay reembolso por insatisfacción con el resultado, por incompatibilidad con tu hardware ni porque la clave todavía no se haya activado.',
        },
        {
          kind: 'p',
          text: 'Abrir un chargeback o una disputa suspende en el acto la licencia y la atención, hasta que la disputa termine. El acceso no sigue mientras el pago esté impugnado.',
        },
      ],
    },
    {
      title: '9. Cambios de estos términos',
      blocks: [
        {
          kind: 'p',
          text: 'Estos términos pueden actualizarse. La versión vigente queda en esta página. Seguir usando el software después de un cambio relevante implica aceptar las nuevas condiciones.',
        },
      ],
    },
  ],
  contact: 'Consultas sobre esta página o sobre el programa: escribinos por los canales oficiales.',
}

const en: LegalCopy = {
  pageTitle: 'Terms and privacy',
  privacyTitle: 'Privacy Policy',
  privacyIntro:
    'Protecting your data is a commitment of TomzBoost, performance optimization software for games on Windows. This policy explains how the program handles information while it runs and how the site handles purchase data. We follow Brazil’s General Data Protection Law (LGPD – Law no. 13,709/2018).',
  privacy: [
    {
      title: '1. Scope',
      blocks: [
        {
          kind: 'p',
          text: 'This policy covers the TomzBoost software and the site where the license is bought, including checkout. It also covers the official support channels in the footer.',
        },
      ],
    },
    {
      title: '2. LGPD principles',
      blocks: [
        {
          kind: 'ul',
          items: [
            'Necessity: only what is needed to run the optimization or complete the purchase.',
            'Purpose: deliver the license, support, and performance while the program is in use.',
            'Transparency: you are told plainly what is processed.',
            'Security: the program’s technical data is not stored or exposed.',
            'Deletion: what the program reads in real time is discarded when it closes.',
          ],
        },
      ],
    },
    {
      title: '3. Technical data from the program',
      blocks: [
        { kind: 'p', text: 'While it runs, TomzBoost may access information about the computer:' },
        {
          kind: 'ul',
          items: [
            'Windows version.',
            'CPU, GPU, RAM, and disk information.',
            'State of active services and processes.',
            'Power, network, graphics, and multitasking settings.',
            'Parameters the system uses to control performance.',
          ],
        },
        {
          kind: 'p',
          text: 'That data is used only in real time to apply optimizations. It is not saved, exported, sent, shared, or stored.',
        },
      ],
    },
    {
      title: '4. What the app does not do',
      blocks: [
        {
          kind: 'ul',
          items: [
            'It does not ask for your name, email, CPF, phone number, or sensitive personal data inside the program.',
            'It does not keep permanent usage logs.',
            'It does not send that technical environment to external servers.',
            'It does not share that data with third parties.',
            'It does not use cookies, remote scripts, trackers, or monitoring modules.',
          ],
        },
      ],
    },
    {
      title: '5. Local, temporary processing',
      blocks: [
        {
          kind: 'p',
          text: 'The technical read happens only while the program is open. When TomzBoost closes, what was processed leaves memory. There is no database, cache, history, or file of that read.',
        },
      ],
    },
    {
      title: '6. Safety of use',
      blocks: [
        {
          kind: 'ul',
          items: [
            'It does not use CMD, PowerShell, or regedit.',
            'It does not change or add game files. That is why it does not cause anti-cheat bans.',
            'It does not make irreversible system changes.',
            'The optimization can be reverted by restarting the computer, if you want.',
          ],
        },
      ],
    },
    {
      title: '7. Site and payment data',
      blocks: [
        {
          kind: 'p',
          text: 'At checkout we ask for your name, email, phone number, and document. We use them to identify the order, deliver the license key, and contact you about payment or support.',
        },
        {
          kind: 'p',
          text: 'Payment is processed by BuckPay, an external provider. The data needed to create the charge is sent to that provider. TomzBoost does not run the payment gateway.',
        },
      ],
    },
    {
      title: '8. Data subject rights',
      blocks: [
        {
          kind: 'p',
          text: 'You can ask for confirmation and transparency about the processing, and for protection against misuse. If a future feature needs personal data inside the program, we will tell you first and ask for consent, as the law requires.',
        },
      ],
    },
    {
      title: '9. Changes',
      blocks: [
        {
          kind: 'p',
          text: 'This policy may be updated if TomzBoost or the site starts handling data differently. The change is published on this page.',
        },
      ],
    },
  ],
  termsTitle: 'Terms of Use',
  termsIntro:
    'Welcome to TomzBoost. By buying the license and installing the program, you state that you read, understood, and accept these Terms of Use and the Privacy Policy.',
  terms: [
    {
      title: '1. Subject',
      blocks: [
        {
          kind: 'p',
          text: 'These terms govern use of TomzBoost, performance optimization software for games on Windows. The program makes technical adjustments to the system to improve performance, without changing games or third-party files.',
        },
      ],
    },
    {
      title: '2. Acceptance',
      blocks: [
        {
          kind: 'p',
          text: 'By buying the license you confirm that you read and agree to these terms and the privacy policy, that you receive a non-exclusive, non-transferable license, and that use is at your own risk, within the law and the available features.',
        },
      ],
    },
    {
      title: '3. License',
      blocks: [
        {
          kind: 'p',
          text: 'The license is personal and non-transferable. It is not commercial unless you have prior written permission. It is a subscription: it includes use of the software and upcoming updates, for the term of the purchase (a set period or lifetime, depending on what you bought).',
        },
        { kind: 'p', text: 'Sharing the license without permission can block the key, with no refund.' },
      ],
    },
    {
      title: '4. Safety and integrity',
      blocks: [
        {
          kind: 'p',
          text: 'TomzBoost is built for games protected by anti-cheat, such as VAC, Easy Anti-Cheat, BattleEye, and Vanguard. It does not change game files, executables, DLLs, or third-party resources. It works on Windows: process priority, scheduling, temporary shutdown of non-essential services, and performance settings. It does not cause bans on a platform or in a game.',
        },
      ],
    },
    {
      title: '5. Intellectual property',
      blocks: [
        {
          kind: 'p',
          text: 'The software, brand, visual identity, name, source code, interface, and other elements of TomzBoost belong to its developers. Copying, modifying, disassembling, reverse engineering, or distributing the software without prior written permission is prohibited.',
        },
      ],
    },
    {
      title: '6. Updates and support',
      blocks: [
        {
          kind: 'p',
          text: 'TomzBoost may receive updates for performance, compatibility with new Windows versions, or new features. Support is through the official channels on this page.',
        },
      ],
    },
    {
      title: '7. Limits of liability',
      blocks: [
        {
          kind: 'ul',
          items: [
            'Use is at your own risk.',
            'Performance gains vary with hardware, Windows version, and other factors.',
            'We are not liable for indirect, accidental, or consequential damage from incorrect or incompatible use.',
          ],
        },
      ],
    },
    {
      title: '8. Sale, delivery, and refunds',
      blocks: [
        {
          kind: 'p',
          text: 'The license is a subscription that includes upcoming updates. When payment is confirmed, a unique key is released. That key is already issued even if you have not activated it, and an identical one will not be generated.',
        },
        {
          kind: 'p',
          text: 'Article 49 of the Brazilian Consumer Defense Code allows a 7-day withdrawal for purchases made outside a physical store. That period does not cover digital content delivered immediately, which cannot be returned once access has been released. There is no refund for dissatisfaction with the result, incompatibility with your hardware, or the key not having been activated yet.',
        },
        {
          kind: 'p',
          text: 'Opening a chargeback or payment dispute suspends the license and support immediately, until the dispute ends. Access does not continue while the payment is contested.',
        },
      ],
    },
    {
      title: '9. Changes to these terms',
      blocks: [
        {
          kind: 'p',
          text: 'These terms may be updated. The current version stays on this page. Continuing to use the software after a material change means you accept the new conditions.',
        },
      ],
    },
  ],
  contact: 'Questions about this page or the program: reach us on the official channels.',
}

export const legalCopy: Record<Locale, LegalCopy> = { es, pt, en }
