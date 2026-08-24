def generate_hospital_layout(rooms_df):

    layout=[]

    for _,room in rooms_df.iterrows():

        layout.append({

            "room_id":room["room_id"],

            "room_name":room["room_name"],

            "department":room["department_name"],

            "floor":int(room["floor"]),

            "capacity":int(room["capacity"]),

            "coordinates":{

                "x":float(room["x_coordinate"]),

                "y":float(room["y_coordinate"]),

                "z":float(room["z_coordinate"])

            }

        })

    return layout