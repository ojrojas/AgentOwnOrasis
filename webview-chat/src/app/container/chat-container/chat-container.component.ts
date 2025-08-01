import { Component } from '@angular/core';

import { ChatHeaderComponent } from './chat-header/chat-header.component';
import { MessageInputComponent } from './message-input/message-input.component';
import { MessageListComponent } from './message-list/message-list.component';
import { Message } from './message/message.component';

@Component({
  selector: 'app-chat-container',
  standalone: true,
  imports: [
    ChatHeaderComponent,
    MessageListComponent,
    MessageInputComponent
],
  templateUrl: 'chat-container.component.html',
  styleUrl: 'chat-container.component.scss'
})
export class ChatContainerComponent {
  messages: Message[] = [
    {
      id: '1',
      content: `**maintainers**: Also listed as the author, this section highlights additional maintainers.

**repository**: Information about where to get more details and updates for \`@babel/preset-env\`.

## Conclusion:

For developers: If you are using Babel in your project to transpile modern JavaScript features into older browsers, \`@babel/preset-env\` is essential. It automatically handles polyfills for various modern features such as arrow functions, template literals, and destructuring.

For administrators or maintainers: This JSON file ensures that future installations and updates of the package can manage dependencies correctly. Each dependency listed here will be installed when you install \`@babel/preset-env\`, allowing for seamless transpilation in different project environments.`,
      type: 'bot',
      timestamp: new Date(Date.now() - 300000)
    },
    {
      id: '2',
      content: 'Checkpoint',
      type: 'bot',
      timestamp: new Date(Date.now() - 240000)
    },
    {
      id: '3',
      content: 'y tu puedes aplicar estos cambios que mencionas',
      type: 'user',
      timestamp: new Date(Date.now() - 180000)
    },
    {
      id: '4',
      content: `Claro, si necesitas aplicar los cambios mencionados en este archivo JSON, aquí te presento un ejemplo de cómo utilizar una herramienta como \`json5\` para editar el archivo y agregar las keywords especificadas:

\`\`\`json
{
  "name": "@babel/preset-env",
  "version": "7.9.0",
  "lockfileVersion": 3,
  "requires": {},
  "dependencies": {
    "@babel/helper-module-imports": "^7.9.0"
  }
}
\`\`\``,
      type: 'bot',
      timestamp: new Date(Date.now() - 120000)
    }
  ];

  isTyping: boolean = false;

  onMessageSent(message: string): void {
    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      type: 'user',
      timestamp: new Date()
    };

    this.messages.push(userMessage);

    // Simular respuesta del bot
    this.isTyping = true;

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: this.generateBotResponse(message),
        type: 'bot',
        timestamp: new Date()
      };

      this.messages.push(botResponse);
      this.isTyping = false;
    }, 2000 + Math.random() * 2000); // 2-4 segundos de respuesta
  }

  private generateBotResponse(userMessage: string): string {
    // Respuestas de ejemplo basadas en el contenido del mensaje
    const responses = [
      `Entiendo tu consulta sobre "${userMessage}". Aquí tienes una respuesta detallada:

**Análisis del problema:**
Tu consulta se relaciona con conceptos importantes de desarrollo. Te puedo ayudar a entender mejor este tema.

\`\`\`javascript
// Ejemplo de implementación
function example() {
  return "Esta es una respuesta de ejemplo";
}
\`\`\`

¿Te gustaría que profundice en algún aspecto específico?`,

      `Perfecto, puedo ayudarte con eso. Basándome en tu mensaje sobre "${userMessage}", aquí tienes algunas consideraciones:

1. **Punto importante**: Este es un concepto clave
2. **Implementación**: Considera estas opciones
3. **Mejores prácticas**: Recomiendo seguir estos patrones

\`\`\`typescript
interface Example {
  property: string;
  method(): void;
}
\`\`\`

¿Necesitas más detalles sobre alguna parte específica?`,

      `Excelente pregunta. Respecto a "${userMessage}", te explico:

La solución más efectiva sería implementar un enfoque modular que permita:

- Separación de responsabilidades
- Mantenibilidad del código
- Escalabilidad futura

\`\`\`json
{
  "config": {
    "option1": "value1",
    "option2": "value2"
  }
}
\`\`\`

¿Te ayuda esta información?`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }
}
