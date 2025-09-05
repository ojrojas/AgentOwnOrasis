import { Component, inject } from '@angular/core';
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from '@angular/material/select';
import { ChatStore } from '../../../store/chat/chat.store';
import { FormsModule } from '@angular/forms';
import { MatCard } from "@angular/material/card";

@Component({
  selector: 'app-chat-settings',
  imports: [
    FormsModule,
    MatSelectModule,
    MatCard
],
  templateUrl: './chat-settings.component.html',
  styleUrl: './chat-settings.component.scss'
})
export class ChatSettingsComponent {
  readonly chatStore = inject(ChatStore);
  modelCompletions: string = '';
  modelRefactors: string = '';
}
