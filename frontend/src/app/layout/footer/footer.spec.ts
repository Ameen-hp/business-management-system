import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFooter } from './footer';

describe('AdminFooter', () => {
  let component: AdminFooter;
  let fixture: ComponentFixture<AdminFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminFooter],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminFooter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
