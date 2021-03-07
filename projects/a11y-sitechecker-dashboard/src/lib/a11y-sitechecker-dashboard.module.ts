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
import { SortByImpactPipe } from './pipes/sortByImpact.pipe';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FixedScrollingDirective } from './directives/fixed-scrolling.directive';
import { LoadingComponent } from './loading/loading.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

@NgModule({
    declarations: [A11ySitecheckerDashboardComponent, SingleResultComponent, SortByImpactPipe, FixedScrollingDirective, LoadingComponent, HeaderComponent, FooterComponent],
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
        MatButtonToggleModule,
        MatProgressSpinnerModule,
        ScrollingModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
    ],
    exports: [A11ySitecheckerDashboardComponent],
    providers: [SortByImpactPipe],
})
export class A11ySitecheckerDashboardModule {}
