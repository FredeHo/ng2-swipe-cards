import { Routes } from '@angular/router';
import { HomeComponent } from './home';
import {TinderComponent} from './tinder';
import { NoContentComponent } from './no-content';

import { DataResolver } from './app.resolver';


export const ROUTES: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'tinder', component: TinderComponent },
  { path: '**', component: NoContentComponent },
];