#Furgoncini
Furgoncini is a light and fast management software for your vans/trucks paths and
for your delivery scheduling.

You can keep stored your shops to be served and the paths for your vans. If you want
to make a temporarily modification, you are able to it without changing your
information stored. When you have finished to make your changes, you can easily
download your paths for the day.


##Requirements
* Ruby (on Windows, try JRuby)
* Gems: _sinatra, json, digest, net/http, erb_
* A free [Directions API key by Google](https://code.google.com/apis/console/?noredirect)


##Usage
Clone this repository:
```
$ git clone git@github.com:lukesmolo/Furgoncini.git
```
Run the program with your Google Key as first parameter:
```
$ ruby main.rb google_key
```
By default trucks have to start from __Roma__ and they have to return there. If you
need to change your base point, please insert the city as second parameter and
the country as third one.

```
$ ruby main.rb google_key Napoli it
```


Open your browser at __0.0.0.0:4567__ and start enjoying Furgoncini.

####db
A simple db stored in json files is provided. If you modify something through the
settings, the modification is stored. Otherwise it is volatile.

####Login
A session login is requested. By default, user and password are empty field.
Please modify __main.rb__ file if you need to change them.


##Screenshots
<img src="/pics/paths.png" width="480">
<br>
<img src="/pics/p_settings.png" width="480">
<br>
<img src="/pics/s_settings.png" width="480">

##Thanks
* [clockpicker](https://github.com/weareoutman/clockpicker)
* [jquery.confirm](https://github.com/myclabs/jquery.confirm)
* [jQuery-printPage-plugin](https://github.com/posabsolute/jQuery-printPage-plugin)
* [editable-table](https://github.com/mindmup/editable-table)
* [Stupid-Table-Plugin](https://github.com/joequery/Stupid-Table-Plugin)
* [livequery](https://github.com/brandonaaron/livequery)

##Status of the project
Feel free to contribute or to make this project better for your needs.

##License
Furgoncini is released under the MIT license.


