import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-approval-pending',
  standalone: false,
  templateUrl: './approval-pending.component.html',
  styleUrl: './approval-pending.component.scss'
})
export class ApprovalPendingComponent implements OnInit{
 reason: 'not-approved' | 'disabled' = 'not-approved';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['reason'] === 'disabled') {
        this.reason = 'disabled';
      }
    });
  }
}
