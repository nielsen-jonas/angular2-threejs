import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GameComponent } from './game/game.component';

const appRoutes: Routes = [
    {
        path: 'game',
        component: GameComponent
    }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);