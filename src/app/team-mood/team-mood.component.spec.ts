import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamMoodComponent } from './team-mood.component';

describe('TeamMoodComponent', () => {
  let component: TeamMoodComponent;
  let fixture: ComponentFixture<TeamMoodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamMoodComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TeamMoodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
