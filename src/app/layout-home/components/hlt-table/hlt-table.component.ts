import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-hlt-table',
  standalone: false,
  templateUrl: './hlt-table.component.html',
  styleUrl: './hlt-table.component.scss'
})
export class HltTableComponent implements AfterViewInit , OnChanges{
 @Input() tableHeading: Array<{ heading: string; data: string }> = [];
  @Input() set tableData(data: any[]) {
    this.dataSource.data = data;
  }
  @Input() loading = false;
  @Input() usePagination: boolean = false;
  @Input() totalItems: number = 0;
  @Input() currentPageIndex: number = 0;
  @Input() customActionTemplate: TemplateRef<any> | null = null;
  @Input() quantityColumnTemplate?: TemplateRef<any>;
  @Input() showNav = true;
  @Input() rowStyles: { [key: string]: string } = {};
  @Input() statusColors: { [key: string]: string } = {};
  @Input() iconMap: { [key: string]: string } = {};
  @Input() showDefaultActions: boolean = true; // New input to toggle default actions

  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() addItem = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();
  @Output() page = new EventEmitter<number>();

  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges() {
    this.displayedColumns = this.tableHeading.map(col => col.data);
    if (this.usePagination && this.paginator) {
      this.paginator.length = this.totalItems;
      if (this.paginator.pageIndex !== this.currentPageIndex) {
        this.paginator.pageIndex = this.currentPageIndex;
      }
    }
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    if (this.usePagination && this.paginator) {
      this.paginator.length = this.totalItems;
      this.paginator.pageIndex = this.currentPageIndex;
    }
  }

  sanitizeImageUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  handleImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/images/fallback-image.png';
  }

  onSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.search.emit(query);
  }

  onPageChange(event: PageEvent) {
    this.page.emit(event.pageIndex);
  }
}
