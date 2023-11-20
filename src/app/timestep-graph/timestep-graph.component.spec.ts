import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimestepGraphComponent } from './timestep-graph.component';

describe('TimestepGraphComponent', () => {
  let component: TimestepGraphComponent;
  let fixture: ComponentFixture<TimestepGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimestepGraphComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TimestepGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
