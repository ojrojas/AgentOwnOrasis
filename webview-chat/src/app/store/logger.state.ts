import { effect, isDevMode } from '@angular/core';
import { getState, signalStoreFeature, withHooks } from '@ngrx/signals';

export function withLogger(name: string) {
  return signalStoreFeature(
    withHooks({
      onInit(store) {
        effect(() => {
          const state = getState(store);
          if (isDevMode()) {
            console.log(`${name} state changed`, state);
          }
        });
      },
    })
  );
}
