import { Component, OnInit, ViewChild  } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import { GlobalService } from './global.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
declare var $: any;
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

interface PeriodicElement {
  date: string;
  indian: number;
  usa: number;
  rate: number;
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  @ViewChild(MatPaginator,{static:true}) paginator: MatPaginator;
  @ViewChild(MatSort,{static:true}) sort: MatSort;
  
  displayedColumns: string[] = ['date', 'indian', 'usa', 'exchange'];
  file;
  ELEMENT_DATA = [
];

email;

constructor(
    public global:GlobalService,
    private ngxService: NgxUiLoaderService) { 
    }
    
dataSource = new MatTableDataSource<PeriodicElement>(this.ELEMENT_DATA);



ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
 
 uploadFile(event) {
     var input:any = event.target.files;
     console.log(event)
     Array.from(event.target.files).forEach((item:Blob, i) => {
      var reader = new FileReader();
      reader.onload = ()=>{
        var dataURL:any = reader.result;
        this.file=event.target.files[0]
        this.update()
      }
      reader.readAsDataURL(item);
      })
   }

   update(){
     let newFormData = new FormData();
     newFormData.append("csv",this.file);
    this.ngxService.start();   
    this.global.post(
      "",
      newFormData,
      data => {
        this.ngxService.stop();
        console.log(data)
        if (data.status) {
         this.dataSource = new MatTableDataSource<PeriodicElement>(data.response);
         this.ELEMENT_DATA = data.response
        } else {
          this.global.showDangerToast("",data.message);
          console.log(data.message)
        }
      },
      err => {
        this.global.showDangerToast("", err.message);
      },
      true
    );

     }

     sendMail(){

      let html='';
      this.ELEMENT_DATA.map(rate=>{
        html = html + `<tr style="border:1px solid #333">
        <td style ="margin:2px 3px 3px 3px;padding:2px 3px 3px 3px"> ${rate.date} </td>
        <td style ="margin:2px 3px 3px 3px;padding:2px 3px 3px 3px"> ${rate.indian} </td>
        <td style ="margin:2px 3px 3px 3px;padding:2px 3px 3px 3px"> ${rate.usa} </td>
        <td style ="margin:2px 3px 3px 3px;padding:2px 3px 3px 3px"> ${rate.rate} </td>
        </tr>`
      })
     
      let newFormData = new FormData();
      newFormData.append("html",this.htmlParse(html));
      newFormData.append("mail",this.email);
      $("#myBtn2").trigger('click');
     this.ngxService.start();   
     this.global.post(
       "sentmail",
       newFormData,
       data => {
         this.ngxService.stop();
         console.log(data)
         if (data.status) {
          this.global.showToast("",data.message);
         } else {
           this.global.showDangerToast("",data.message);
           console.log(data.message)
         }
       },
       err => {
         this.global.showDangerToast("", err.message);
       },
       true
     );
 
     }

 triggerFile(){
       $("#file-input").trigger('click');
  }

  
 htmlParse = (table)=>{
  let html = `<html>
  <table width="600" style="border:1px solid #333">
          <tr style="border:1px solid #333">
            <td style ="margin:2px 3px 3px 3px;padding:2px 3px 3px 3px"> Date </td>
            <td style ="margin:2px 3px 3px 3px;padding:2px 3px 3px 3px"> Indian </td>
            <td style ="margin:2px 3px 3px 3px;padding:2px 3px 3px 3px"> USA </td>
            <td style ="margin:2px 3px 3px 3px;padding:2px 3px 3px 3px"> Exchange </td>
          </tr>
          ${table}
  </table>
  </html>`
  return html;
  
  }
  
   
}
