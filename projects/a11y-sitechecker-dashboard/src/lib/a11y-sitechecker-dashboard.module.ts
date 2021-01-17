import { NgModule } from '@angular/core';
import { A11ySitecheckerDashboardComponent } from './a11y-sitechecker-dashboard.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { ChartModule } from 'angular-highcharts';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { SingleResultComponent } from './single-result/single-result.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { UrlFilterPipe } from './urlFilter.pipe';

@NgModule({
    declarations: [A11ySitecheckerDashboardComponent, SingleResultComponent, UrlFilterPipe],
    imports: [
        MatCardModule,
        MatIconModule,
        MatToolbarModule,
        MatButtonModule,
        ChartModule,
        MatTabsModule,
        HttpClientModule,
        CommonModule,
        MatExpansionModule,
        MatBadgeModule,
        MatChipsModule,
        MatListModule,
    ],
    exports: [A11ySitecheckerDashboardComponent],
})
export class A11ySitecheckerDashboardModule {}
