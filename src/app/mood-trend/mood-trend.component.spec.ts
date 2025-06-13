import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoodTrendComponent } from './mood-trend.component';

describe('MoodTrendComponent', () => {
  let component: MoodTrendComponent;
  let fixture: ComponentFixture<MoodTrendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoodTrendComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MoodTrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
