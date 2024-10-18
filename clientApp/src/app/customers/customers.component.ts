import { Component } from '@angular/core';
import { TableModule } from 'primeng/table';
import axios from 'axios';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import moment from 'moment';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    CommonModule,
    ProgressSpinnerModule,
    ReactiveFormsModule,
    DropdownModule,
    TooltipModule,
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss',
})
export class CustomersComponent {
  generateCount = new FormControl(0, [
    Validators.required,
    Validators.pattern('^[0-9]*$'),
    Validators.minLength(1),
  ]);

  _lastSelectedItemId: any = '';
  customers: any[] = [];
  currentCustomer = new FormGroup({});
  apiState: { isFetching: boolean; isUpdating: boolean } = {
    isFetching: false,
    isUpdating: false,
  };
  columnNames: { formatted: string; raw: string }[] = [
    {
      formatted: '',
      raw: '',
    },
  ];

  editableColumnNames: { formatted: string; raw: string }[] = [
    {
      formatted: '',
      raw: '',
    },
  ];

  dialogVisibility: { [key: string]: boolean } = {
    generate: false,
    update: false,
  };

  async ngOnInit() {
    this.apiState.isFetching = true;
    try {
      const result = await axios.get('/api/customer/list');
      this.customers = result.data;
      this.setColumnNames();
      this._lastSelectedItemId = localStorage.getItem('_lastSelectedItemId');
    } catch (ex) {
      console.log('Something went wrong with the API call:', ex);
    }
    this.apiState.isFetching = false;
  }

  setColumnNames() {
    if (this.customers.length > 0) {
      const single = this.customers[0];
      this.columnNames = Object.keys(single).map((key) => ({
        formatted: key.split(/(?=[A-Z])/).join(' '),
        raw: key,
      }));
    }
  }

  getColumnValue(data: any, column: string) {
    if (moment(data[column], moment.ISO_8601, true).isValid()) {
      return moment(data[column]).format('MMM Do, YY');
    }
    return data[column];
  }

  requestModify(customer?: any) {
    const data = customer;

    const group: any = {};

    const ignored_ui_keys = ['id', 'createdOn', 'lastUpdatedOn'];
    Object.keys(data || this.customers[0]).forEach((key) => {
      if (!data) {
        if (!ignored_ui_keys.includes(key)) {
          group[key] = new FormControl(null, Validators.required);
        }
      } else {
        group[key] = new FormControl(data[key], Validators.required);
      }
    });

    this.currentCustomer = new FormGroup(group);

    this.editableColumnNames = Object.keys(this.currentCustomer.value)
      .filter((key) => !ignored_ui_keys.includes(key))
      .map((key) => ({
        formatted: key.split(/(?=[A-Z])/).join(' '),
        raw: key,
      }));
    this.toggleDialog('update');
  }

  toggleDialog(key: string) {
    this.dialogVisibility[key] = !this.dialogVisibility[key];
  }

  async performUpdate() {
    this.apiState.isUpdating = true;

    try {
      const result = await axios.post(
        '/api/customer/update',
        this.currentCustomer.value
      );
      if (result.data) {
        const _updateIdx = this.customers.findIndex(
          (x) => x.id == result.data.id
        );
        if (_updateIdx >= 0) this.customers[_updateIdx] = result.data;
        else this.customers.push(result.data);

        this.toggleDialog('update');
      }
    } catch (ex) {
      console.log(
        'Could not perform add/update. Something went wrong with the API!',
        ex
      );
    }
    this.apiState.isUpdating = false;
  }

  async performGenerate() {
    this.apiState.isUpdating = true;
    try {
      const result = await axios.post(
        `/api/customer/generate?count=${this.generateCount.value}`
      );
      if (result.data) {
        console.log('Generate result:', result.data);
        this.customers = this.customers.concat(result.data);
      }
      this.toggleDialog('generate');
    } catch (ex) {
      console.log('Could not generate random records.', ex);
    }
    this.apiState.isUpdating = false;
  }

  handleSelection(data: any) {
    localStorage.setItem('_lastSelectedItemId', data.id);
    this._lastSelectedItemId = data.id
  }
}
