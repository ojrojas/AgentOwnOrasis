import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VscodeService } from './core/services/vscode-service';
import { IListModelsResponse } from './core/types/models.types';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'webview-chat';
  vscodeService = inject(VscodeService);
  responseStatus = signal({ id: '', name: '' });
  responseModels = signal<IListModelsResponse | undefined>(undefined);

  ngOnInit(): void {
    this.status();
  }
  status = async () => {
    const reesponse = await this.vscodeService.request("emitStatusAppChat", "ready on app chat on extension");
    this.responseStatus.set(reesponse);
    const response2 = await this.vscodeService.request("getModels", "getModels");
    debugger;
    this.responseModels.set(response2);
  };
}
