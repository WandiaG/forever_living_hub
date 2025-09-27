import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMessages } from './view-messages';

describe('ViewMessages', () => {
  let component: ViewMessages;
  let fixture: ComponentFixture<ViewMessages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewMessages]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewMessages);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
