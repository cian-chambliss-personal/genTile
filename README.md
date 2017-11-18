# genTile

Game Tile Generation Markup Language.

The genTile format (.gnt) is an ascii format for representing game object definitions and levels.

[markdown definition]: https://en.m.wikipedia.org/wiki/Markdown

[xpm format]: https://en.m.wikipedia.org/wiki/X_PixMap

genTile draws inspiration from the  [markdown definition], the  [xpm format]
, and from old school game designs done on graph paper, as well as custom dungeon & dragons campaigns.

Though the top level assumption is a top-down game, the markup language can handle elevations as well, so defining a platformer/side-scrollers should be possible (i.e. the super mario world games, the world selector is a top-down map, the levels are all in elevation).

This is a first draft, and there are numerous omissions (like material and character generation).



# Types

Types for expanses start with a hash (#) character.  Examples would be grassland, sanddunes, rock, paved.  (note - a later draft will probably cover rules for generation of objects , subexpanses and features within an expanse)

Types for features start with a exclamation mark (!). Example features are roads, paths, walls, streams, bridges and walkways, as well as routes used by AI to patrol.

Types for objects start with alphabetic character. Examples are individual trees, rocks, goblins etc.

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

Letter Number combinations are treated as column/row pairs, for nautical style charts / spreadsheet notation, an asterisk (\*) represents wildcard if it is desired there be a global fallback 'tile' or fallback for a row or column.

As with spreadsheets, ranges can be expressed as letter followed by number, followed by "..", followed by another letter and number.

Front, Left, Right and Left are elevations.
Floor followed by number is level in a floor plan.


```
Example Charts
@greatsea/A5
@greatsea/B3
@greatsea/Y11
@greatsea/*
@greatsea/C*
@greatsea/*13
@greatsea/G10..H12


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

The asterisk character (\*) denotes a change in direction for a path.

The slash characters (/) and (\\) are used to connect diagonals.

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
.----+------.
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

[Whim]: https://github.com/cian-chambliss-personal/Whim


AI and scripting use the ?prefix and define thier content in the [Whim] format.  

And example of embedded 'Whim' script:

```
?weaponseller = {
 @shop
        > ?
            " What do you want to buy?
            = bow
                > " Arrows
                    - coin * 20
                        " Sorry, you don't have enough gold.
                    + arrow * 10
                        " Sorry, you don't have enough room in your quiver.
                    <
            > " Sword
                - coin * 300
                    " Sorry, you don't have enough gold.
                + sword
                <
            = first
                > " Just browsing...
                    " Let me know if you need help...
                <
            = next
                ? " Anything else?
                    ...
            = notFirst
                > " Nope.
                <
            " Thank you, come again!
            <
}
```

Areas covered by scripting are

- Conversation and trading (even if for information or karma).
- Patroling, Fighting (Damage)
- Plot advancement (trades that change state of the game)

# Intermediate

The intermediate language for genTile is expressed in JSON.  The genTile input will be converted to a JSON format that drives the generators.

The intermediate language has top level of "defs" and "maps" for definition types and map definitions.  points information is stored in separate channels (so that more channels can be added/ generated).


```JSON
{
    "defs" : {
       "expanse" : {
           "desert" :  {
               "color" : "yellow"
           },
           "mesa" : {
               "color" : "orange"
           }
       },
       "feature" : {
           "road" : {
              "color" : "gray"
           },
           "dirt_road" : {
              "color" : "brown"
           }
       }
    } ,
    "maps" : {
        "marketsquare" : {
           "type" : {  "expanse" : "desert"  } ,
           "expanses" : {
             "mesa_1" : {
               "type" : "mesa" ,
               "levels" : {
                   "base" : { 
                       "channel" : {
                           "x" :  [ 120 , 150 , 145 ],
                           "y" :  [ 100 , 20 , 120 ],
                           "z" :  0
                       }
                    }
                   } ,
                   "summit" : {
                       "channel" : {
                           "x" :  [ 140 , 150 , 145 ],
                           "y" :  [ 100 , 20 , 120 ],
                           "z" :  20
                       }
                   } 
                 }                            
               }
           } ,
           "features" : {
               "road_1" : {
                  "channels" : {
                  "x" : [100,110,120,130,110,80],
                  "y" : [20,40,30,40,60,70],
                  "z" : 0 ,
                  "type" : ["road",null,null,"dirt_road",null,null]
                  }
               }
           }           
        } , 
        "woods" : {
        }
    }
}
```

# Generators

Initially, intermediate format will be used to generate will used to generate 2D and 2 1/2 D SVG graphics.

Followed by output for scenes top 3d .obj files and a webGl renderer. 

