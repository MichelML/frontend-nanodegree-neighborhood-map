<h1>Q - Search top places in Quebec city</h1>   
  
Q, pronounced _cue_, helps you search nice places to visit in the very welcoming city of [Quebec](https://www.google.ca/maps/place/Ville+de+Qu%C3%A9bec,+QC/@46.8576655,-71.6262536,10z/data=!3m1!4b1!4m5!3m4!1s0x4cb8968a05db8893:0x8fc52d63f0e83a03!8m2!3d46.8138783!4d-71.2079809) in Canada.   
  
  
![Frontenac Castle in Quebec city](quebeccity.jpg)  
  
  
## Preview the application  
You have two options for testing and using Q. 
### Option 1 - Preview on the Web
You can view the application directly in your browser at the following [link](https://michelml.github.io/q/dist/public/).  
### Option 2 - Preview locally
Once [Node.js](https://nodejs.org/en/), [Npm](https://www.npmjs.com/), and [Git](https://git-scm.com/) are installed on your computer, go to the local directory of your choice from your terminal, and run the following command:  
```  
git clone https://github.com/MichelML/q.git
```
Now the project being on your computer, you can preview the application locally by following these steps:  
  
1. Go to the `dist` folder of the project directory  
2. Run the command `node index.js` in your terminal  
3. View the application in your favorite browser at the following address: `http://127.0.0.1/8080`  
  
## Edit the application  
After cloning the project on your computer, you can also edit the application to your taste by accessing the commented and structured version of the project in the `src` directory.  

### Build process  
This application also comes bundled with Gulp and basic build tasks helping you move from the development version of the project to distribution. After cloning the repository, run the following command from the project's root directory (`q/`) to install all dependencies of the build process:  
```  
npm install
```  
Once all the dependencies are installed, you can run the default Gulp process by typing the following command in your terminal: 
```
gulp
```
You can also run independent tasks by running the following command:  
```
gulp <name of the task>
```  
To learn more about what is Gulp and how to use it, [visit Gulp's website](http://gulpjs.com/).        
    
## Third-party technologies    
As of the last edit of this README, Q is supported by the following third-party technologies:    
#### Design    
* [Materialize](http://materializecss.com/) - Material Design appearance of the application  
* [Google Fonts](https://www.google.com/fonts) - Fonts of the application  
  
#### DOM manipulation   
* [jQuery](https://jquery.com/) - DOM selection, animation, and event handling   
  
#### Data-binding and MVVM framework    
* [Knockout.js](http://knockoutjs.com/) - Data-binding and MVVM framework    
  
#### Local storage technology    
* [localForage](https://github.com/localForage/localForage) - Callback functions when accessing localStorage of browser windows  
  
#### API    
* [Google Maps API](https://developers.google.com/maps/web/?hl=en) - Map display, markers, and info windows      
* [FourSquare API](https://developer.foursquare.com/) - Information about top local places in Quebec city    
    
## MIT License    
Copyright (c) 2016 Michel Moreau  
  
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:  
  
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.  
  
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.  
