import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, test } from 'vitest';

import {BlockUiComponent} from "./block-ui.component";

describe('BlockUiComponent', () => {
  let component: BlockUiComponent;
  let fixture: ComponentFixture<BlockUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockUiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlockUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test.skip('should create', () => {
    expect(component).toBeTruthy();
  });
});