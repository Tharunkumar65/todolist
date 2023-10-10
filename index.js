const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
const _=require("lodash");
const  dotenv = require("dotenv").config();

const app= express();
const port = process.env.PORT ||3000
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect(process.env.MONGODB_url,{useNewUrlParser:true})
.then(function(){
    console.log("Database connected successfully");
})
.catch(function(err){
    console.log(err);
})

const itemsSchema= {
      name:String
}
const Item= mongoose.model("Item",itemsSchema);
const item1= new Item({
     name:"Buy items"
})
const item2=new Item({
    name:"cook food"
});
const item3 = new Item({
    name:"Eat food"
})

const defaultItems= [item1,item2,item3];

const listsSchema= {
    name:String,
    items:[itemsSchema]
}
const List = new mongoose.model("List",listsSchema);




app.get("/",(req,res)=>{
    // var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    // var today  = new Date();
    // const day= today.toLocaleDateString("en-US",options);
    Item.find()
    .then(function(items){
        if(items.length===0){
            Item.insertMany(defaultItems)
            .then(function(){
                console.log("inserted data successfully");
            })
            .catch(function(err){
                console.log(err);
            })
            res.redirect('/');
        }
        else{
            res.render("index.ejs",{
                listTitle:'Today',
                newlist:items
        })  
        }
          
 });
})
app.post("/",(req,res)=>{
    const itemName = req.body.newlist;
    const listName= req.body.list;
    const item = new Item({
        name:itemName
    })
   
    if(listName === "Today"){
        item.save();
        res.redirect('/');
    }
    else{
        List.findOne({name:listName})
        .then((list)=>{
            if(list){
                list.items.push(item);
                list.save();
                res.redirect("/"+ listName);
            }
            else{
                console.log("no list found");
            }
           
        })
        .catch((err)=>{
           console.log("error while posting listname");
        })
    }

})

app.post("/delete", (req, res) => {
    const checkedId =_.capitalize(req.body.checkbox);
    const listName = req.body.listName;


        // Delete the item from the Item model
        Item.findByIdAndRemove(checkedId)
        .then(() => {
            
                console.log("Deleted successfully");
                res.redirect("/");
            });
    // } else {
    //     // Delete the item from the List model
    //     List.findOne({ name: listName }) 
    //     .then((err, foundList) => {
    //         if (!err) {
    //             // Find the item to delete within the list
    //             const itemToDelete = foundList.items.find((item)=> item._id === checkedId);

    //             if (itemToDelete) {
    //                 // Remove the item from the list's items array
    //                 foundList.items.remove(itemToDelete);

    //                 // Save the updated list
    //                 foundList.save((err) => {
    //                     if (!err) {
    //                         // Delete the item itself from the Item model
    //                         Item.findByIdAndRemove(checkedId, (err) => {
    //                             if (!err) {
    //                                 console.log("Deleted successfully");
    //                                 res.redirect("/" + listName);
    //                             } else {
    //                                 console.log("Error deleting by ID: " + err);
    //                             }
    //                         });
    //                     } else {
    //                         console.log("Error saving list: " + err);
    //                     }
    //                 });
    //             } else {
    //                 console.log("Item not found in the list.");
    //             }
    //         } else {
    //             console.log("Error finding list: " + err);
    //         }
    //     });
    // }
});


 


app.get("/:customListName",(req,res)=>{
     const customListName=req.params.customListName;
     
     List.findOne({name:customListName})
     .then((list)=>{
        if(!list){
            const list= new List({
                name : customListName,
                items: defaultItems
            })
            list.save();
            res.redirect("/"+customListName);
        }
        else{
            res.render("index.ejs",{listTitle:customListName,newlist:list.items})
        }
     })
     .catch((err)=>{
        console.log(`Error by getting Listname: ${err.message}`);
     })
     
   
})

app.listen(port,()=>{
    console.log(`listening port at ${port}`);
})