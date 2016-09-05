Encoding.default_external = "UTF-8"

require 'sinatra'
# require "sinatra/reloader" if development?
require 'json'
require 'digest'
require 'net/http'
require 'erb'


if ARGV.length < 1
	puts "Please insert yout Google Key"
	exit
end

$Google_Key = ARGV[0]

if ARGV.length < 2
	$Base = 'Roma'

else
	$Base = ARGV[1]
	puts "Your favourite city is #{$Base}"
end

if ARGV.length < 3
	$Country = 'it'

else
	$Country = ARGV[2]
	puts "Your country is #{$Country}"
end


use Rack::Auth::Basic, "Restricted Area" do |username, password|
	  username == '' and password == ''
end
after do
	        expires 10, :public, :'no-cache', :must_revalidate
		    end
get '/' do
	@page_title ='Furgoncini'
	erb :index
end

post '/make_print' do
	body = JSON.parse(request.body.read)

	tmp = []
	tmp0= []
	tmp1= []
	tmp2= []
	tmp = body["paths"]
	i = 0
	while i < tmp.length do

		tmp0.push(tmp[i])
		tmp1.push(tmp[i+1])
		tmp2.push(tmp[i+2])
		i+=3
	end
	tmp0 = tmp0.reject{|z| z.nil?}
	tmp1 = tmp1.reject{|z| z.nil?}
	tmp2 = tmp2.reject{|z| z.nil?}
	@paths0 = tmp0
	@paths1 = tmp1
	@paths2 = tmp2

	puts tmp

	template= File.read('views/print.erb')

	erb = ERB.new(template)
	File.open('public/static/print.html', 'w') do |f|
		f.write erb.result(binding)
	end
	{ :result => 'Insertion was fine'}.to_json
end

get '/print' do

	@page_title ='Furgoncini'
	template= File.read('public/static/print.html')
	return template
end


post  '/get_paths' do
	body = JSON.parse(request.body.read)
	puts body
	day = body["day"]	
	file = File.read('public/static/paths.json')
	data_hash = JSON.parse(file)
	puts data_hash[day]
	#data_hash["monday"].each_hash do |r|
	#	tmp.push(r.to_json)
	#end
	return data_hash[day].to_json

end

post  '/get_shops' do
	body = JSON.parse(request.body.read)
	puts body
	file = File.read('public/static/shops.json')
	data_hash = JSON.parse(file)
	#data_hash["monday"].each_hash do |r|
	#	tmp.push(r.to_json)
	#end
	return data_hash.to_json

end



post  '/modify_paths' do

	to_delete = false
	to_add = false
	to_order = false
	to_save = false

	#puts request.body.read

	body = JSON.parse(request.body.read)

	if body.has_key?("to_add")
		to_add = true

	elsif body.has_key?("to_delete")
		to_delete = true
	else
		path_new_param = body["new_param"]
		path_new_value = body["new_value"]
	end

	if body.has_key?("to_order")
		to_order = true
	end

	path_id = body["id"]
	path_day= body["day"]
	to_save = body["to_save"]

	if path_new_param == 'shops'
		tmp_shops =  JSON.parse(File.read("public/static/shops.json"))
	end

	tmp =  JSON.parse(File.read("public/static/paths.json"))

	if to_add
		path_name = body["name"]
		path_time = body["time"]

		new_obj = {
			'name' => path_name,
			'time' => path_time,
			'shops' => []
		}
		tmp_string = new_obj['name'] + new_obj['time']
		new_obj["id"] = Digest::SHA256.hexdigest tmp_string


		tmp[path_day].push(new_obj)
	else
		tmp[path_day].each do |x|
			if x['id'].eql? path_id
				if to_delete == true
					tmp[path_day].delete(x)
				else
					if path_new_param == 'shops'


						x[path_new_param] = Array.new(path_new_value.length);
						tmp_shops.each do |y|
							index = path_new_value.index(y['id'])
							if not index == nil
								x[path_new_param][index] =  y

							end
						end
						x[path_new_param] = x[path_new_param].reject{|z| z.nil?}
						if to_order
							result = automatic_reorder(x[path_new_param])
							if result == -1
								return { :result => 'Request refused'}.to_json
							else
								x[path_new_param] = result;
							end

						end
					else
						x[path_new_param] = path_new_value

						tmp_string = x["name"] + x["time"]
						x["id"] = Digest::SHA256.hexdigest tmp_string
					end
					puts x
				end
			end
		end
	end
	#puts new_obj.to_json

	if to_save
		File.open("public/static/paths.json","w") do |f|
			f.write(tmp.to_json)
			puts "saved"
		end
	end

	return tmp[path_day].to_json

end


post  '/modify_shops' do

	to_delete = false
	to_add = false

	body = JSON.parse(request.body.read)

	if body.has_key?("to_add")
		to_add = true

	elsif body.has_key?("to_delete")
		to_delete = true
	else
		shop_new_param = body["new_param"]
		shop_new_value = body["new_value"]
	end

	shop_id = body["id"]




	tmp =  JSON.parse(File.read("public/static/shops.json"))


	if to_add
		key = $Google_Key
		base = $Base
		new_city = body["new_city"]
		new_name = body["new_name"]

		puts new_city
		puts new_name

		request = 'https://maps.googleapis.com/maps/api/directions/json?origin='+base+'&destination='+new_city+'&avoid=highways&mode=driving&region='+$Country+'&'+key


		request = URI.encode(request)
		puts request

		new_obj = {}
		answer =  JSON.parse(Net::HTTP.get(URI request))
		if answer['status'] == 'OK'
			new_obj['dist'] = answer['routes'][0]['legs'][0]['distance']['value']
			new_obj['lat'] = answer['routes'][0]['legs'][0]['end_location']['lat']
			new_obj['lng'] = answer['routes'][0]['legs'][0]['end_location']['lng']
			new_obj["city"] = new_city
			new_obj["name"] = new_name
			tmp_string = new_obj["city"] + new_obj["name"]
			new_obj["id"] = Digest::SHA256.hexdigest tmp_string

			tmp.push(new_obj)
			puts new_obj

		else
			{ :result => 'City Not Found'}.to_json


		end

	else
		tmp.each do |x|

			if x['id'].eql? shop_id
				if to_delete
					tmp.delete(x)
				else
					x[shop_new_param] = shop_new_value
					tmp_string = x["city"] + x["name"]
					old_id = x['id']
					x["id"] = Digest::SHA256.hexdigest tmp_string
					tmp_paths =  JSON.parse(File.read("public/static/paths.json"))
					days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
					days.each do |day|
						tmp_paths[day].each do |path|
							path['shops'].each do |old_shop|
								if old_shop['id'] == old_id
									puts "here"
									path['shops'].delete(old_shop)
									path['shops'].push(x)
								end
							end
						end
					end
					File.open("public/static/paths.json","w") do |f|
						f.write(tmp_paths.to_json)
					end

				end
			end
		end
	end


	File.open("public/static/shops.json","w") do |f|
		f.write(tmp.to_json)

	end

	{ :result => 'Insertion was fine'}.to_json
end

def automatic_reorder(shops)
	key = $Google_Key
	ids = {}
	ids.compare_by_identity
	cities = []
	shops.each do |x|
		cities.push(x["city"])
		ids[x["city"]] = x["id"]
	end

	str =""
	cities.each do |x|
		str += "|"
		str += x.gsub(" ", "+")

	end
	puts str

	request = "https://maps.googleapis.com/maps/api/directions/json?origin="+$Base+"&destination="+$Base+"&avoid=highways&waypoints=optimize:true" + str + "&region="+$Country+"&key=" + key

	request = URI.encode(request)
	puts request

	answer =  JSON.parse(Net::HTTP.get(URI request))
	if answer['status'] == 'OK'
		tmp_order =  answer["routes"][0]["waypoint_order"]

		order = {}

		for i in  0..tmp_order.length-1
			order[ids[cities[tmp_order[i]]]] = i
			puts ids[cities[tmp_order[i]]]
			puts cities[tmp_order[i]]
		end


		tmp_shops = Array.new(shops.length)
		shops.each do |x|
			index = order[x["id"]]
			tmp_shops[index] =  x
		end

		puts tmp_shops
		tmp_shops = tmp_shops.reject{|z| z.nil?}

		return tmp_shops	
	else
		return -1
	end
end
