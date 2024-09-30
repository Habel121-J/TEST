import { LightningElement } from 'lwc';

    const  baseUrl  =  'https://api.openweathermap.org/data/2.5/weather?q='
    const  endUrl =  '&APPID=a9c8bf8df692b64e13ccb5dbf93bd526'


export default class WeatherApi extends LightningElement {

        calloutUrl;
        weatherdata;
        loadWeather = false;
        async handleClick(){        
            let city = this.template.querySelector('.City').value;
            console.log('city---->',city);
            this.calloutUrl = baseUrl+ city +endUrl + '&units=metric';
                let data =  await fetch(this.calloutUrl);
                this.weatherdata = await data.json();
                console.log('response--->',this.weatherdata);
                this.loadWeather = true;
    }


}