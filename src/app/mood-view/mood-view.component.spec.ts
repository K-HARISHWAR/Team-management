import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoodViewComponent } from './mood-view.component';

describe('MoodViewComponent', () => {
  let component: MoodViewComponent;
  let fixture: ComponentFixture<MoodViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoodViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MoodViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
