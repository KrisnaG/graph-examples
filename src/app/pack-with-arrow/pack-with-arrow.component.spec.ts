import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackWithArrowComponent } from './pack-with-arrow.component';

describe('PackWithArrowComponent', () => {
  let component: PackWithArrowComponent;
  let fixture: ComponentFixture<PackWithArrowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackWithArrowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PackWithArrowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
