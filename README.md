# genTile

Game Tile Generation Markup Language.

The genTile format (.gnt) is an ascii format for representing game object definitions and levels.

genTile draws inspiration from the markdown definition, and from old school game designs done by hand on graph paper, as well as custom dungeon & dragons campaigns.

This is a first draft, and there are numerous omissions (like material and character generation).



# Types

Types for expanses start with a hash (#) character.  Examples would be grassland, sand, stone, pavers.

Types for features start with a exclamation mark (!). Example features are roads, paths, walls, streams, bridges and walkways, as well as routes used by AI to patrol.

Types for objects start with alphabetic character. Examples are trees, rocks, goblins etc.

Types are defined as the name, followed by a '=' followed by a curly brace, with Json definition to a matching end curly brace '}'.

```
#sand = {
    "color" : "Yellow"
}

!road = {
    "color" : "LightBlue"
}
```

Properties for types are yet to be determined (there are also going to need to be rules that govern how types interact with each other).

# Map

A map starts with a at sign (@) followed by the name of the map.  The Hash sign (#) is used as the border and the the first character of legend entries.

The first line of the legend is a semicolon separated list of default types for the map.

Subsequent Legend entries are a character (with optional replacement map character) followed by a (=) and a list of semicolon (;) separated type names, portal source and destination values (to/from other maps) and scalars for elevation changes.

A portal source name starts with a (@) character, followed by a map name, followed by an optional (:) character to denotes a destination within the map.  A name starting with a ':' is a portal 'destination' - the connection to the portal source.


```
@hillside
##############
#            #
#  t    t    #
#     t    t #
#   t    t   #
#      g     #
##############
# #grassland
# t = tree
# g = goblin
```

# Multipart Map Names

If the map name includes a slash (/) character, then the name after the slash defines the submap as well as the orientation.

Letter Number combinations are treated as row/column pairs, for nautical style charts.

Front, Left, Right and Left are elevations.
Floor followed by number is level in a floor plan.


```
Example Charts
@greatsea/A5
@greatsea/B3
@greatsea/Y11

Example Buildings

Map view:
@cityhall

Elevations:

@cityhall/Front
@cityhall/Left
@cityhall/Right
@cityhall/Back

Floor plans:
@cityhall/Floor1
@cityhall/Floor2
@cityhall/Floor3
```

# Nesting

Objects can be placeholders for submaps, which allows for different levels of detail within a map,  which is important when maps are so simplistic.


# Expanses

Every map already has a default expanse defined by the bounds, expanses within a map are separated (inclusing) the comma (,) characters and elevation change characters , less than (<) for down right to left, greater than (>) for down left to right, caret '^' for down bottom to top, and tilde (~) for down top to bottom.

```
@hillside
##############
#            #
#    ^^^^^   #
#   <     >  #
#   <  h  >  #
#   <     >  #
#    ~~~~~   #
#            #
##############
# h = #hill
```


# Features

The dash and pipe characters (-) and (|) characters denote north-south and east-west paths.

The asterisk character (*) denotes a change in direction for a path.

The slash characters (/) and (\) are used to connect diagonals.

The plus character (+) denotes either an intersection or tee.

If a feature extends off the edge of a map, the edge should contain a period (.) instead of a hash (#).

```
@bendinroad
#############
#   *---*   #
#  /     \  #
# *       * #
# |  |    | #
# +--*    | #
# |       | #
##.#######.##
# #grassland;!road
```

Override the default feature type by adding a legend character with the replacement cell type for the feature.   In this example, a river intersects (interrupts) a path: 

```
@intersection
#####.#######
#    |      #
#    |      #
#----+------#
#    |      #
#    r      #
#####.#######
# #grassland;!path
# r(|) = !river
```

The single quote (') is used to represent the scale of an object , the location of the legend character within the object controls the orientation of the object (i.e. letter is always on the front of an object).

```
@marketsquare
##################
#                #
# ''' '''''      #
#~'C'~''L''~~<   #  
#            ''' #
#  p         B'' #
#            ''' #
#            <   #     
#            ''' #
#            M'' #
#            ''' #
#            <   #
##################
# #green;1'
# p = #pavement
# C = @Courthouse
# L = @Library
# B = @Bakery
# M = @MeatMarket
```
# AI and Scripting

This is still to be defined, but the plan is to have an embedded JSON representation of action and dialog.  (?) is the prefix character for scripting.

Something like this:

```
?weaponseller = {
   {
    "question" : "what do you want to buy?",
    "answers" : [
        {
            "answer" : "Buy arrows" ,
            "exchange" : {
                "give" : { "name" : "coin" , "qty" : 20  } ,
                "take" : { "name" : "arrows" , "qty" : 10 }
            },
            "fail" : "Sorry, you don't have enough gold.",
            "succeed" : "Thank you, come again"
        }
    ]
    ..
}
```

Areas covered by scripting are

- Conversation and trading (even if for information or karma).
- Patroling, Fighting (Damage)
- Plot advancement (trades that change state of the game)

# Generators

Initially, a definition will used to generate 2D and 2 1/2 D SVG graphics.