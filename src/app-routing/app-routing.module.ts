import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ImgurImageSelectorComponent} from '@/components/imgur-image-selector/imgur-image-selector.component';

const routes: Routes = [
  {path: 'callback', component: ImgurImageSelectorComponent},
  {path: '**', redirectTo: 'callback'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
