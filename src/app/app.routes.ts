import { Routes } from '@angular/router';

export const routes: Routes = [
    {
    path:'',
    loadComponent: () =>
     import('./login/login.component').then(m => m.LoginComponent),
},
 {
    path:'home',
    loadComponent: () =>
     import('./home/home.component').then(m => m.HomeComponent),
},
{
  path:'admin',
  loadComponent:()=>
    import('./admin/admin.component').then(m=>m.AdminComponent),
},
{
  path:'mood-form',
  loadComponent:()=>
    import('./mood-form/mood-form.component').then(m=>m.MoodFormComponent),
},
{
  path:'team-mood',
  loadComponent:()=>
    import('./team-mood/team-mood.component').then(m=>m.TeamMoodComponent),
},
{
  path:'create-member',
  loadComponent:()=>
    import('./create-member/create-member.component').then(m=>m.CreateMemberComponent),
},
{
  path:'mood-trend',
  loadComponent:()=>
    import('./mood-trend/mood-trend.component').then(m=>m.MoodTrendComponent),
}
];
