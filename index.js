//Store all of the HTML elements in variables
        const textinput = document.getElementById('textinput');
        const username = document.getElementById('username');
        const handle = document.getElementById('handle');
        const replies = document.getElementById('replies');
        const retweets = document.getElementById('retweets');
        const likes = document.getElementById('likes');
        const canvas = document.getElementById('textCanvas');
        const canvasContent = canvas.getContext('2d');
        const downloadBtn = document.getElementById('downloadBtn');
        const dateInput = document.getElementById('date');
        const imageUpload = document.getElementById("imageUpload");
        const embedUpload = document.getElementById("embedUpload");
        const colorPick = document.getElementById('bgcolor');

//Takes the user's current date and time, only stores the date in these three variables, probably unnecessary, need to redo it with a single array
        const today = new Date();
        const ourffuckinyear = today.getFullYear();
        const ourffuckinmonth = String(today.getMonth() + 1).padStart(2, '0'); 
        const ourffuckinday = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${ourffuckinyear}-${ourffuckinmonth}-${ourffuckinday}`;

//This is what's gonna show up in the date textbox
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

//Images.
        const TextThing = new Image();
        const baseImage = new Image();
        const bottomImage = new Image();
        const closeBox = new Image();
        const stretchBox = new Image();
        const at = new Image();
        const at2 = new Image();

        let uploadedImage = null;
        let uploadedEmbed = null;

        imageUpload.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();

            reader.onload = () => {
                uploadedImage = new Image();
                uploadedImage.onload = draw;
                uploadedImage.src = reader.result;
            };

            reader.readAsDataURL(file);
        });

//I wanted to make this a single function, didn't want to copypaste the whole thing again, but I couldn't get it to work
        embedUpload.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();

            reader.onload = () => {
                uploadedEmbed = new Image();
                uploadedEmbed.onload = draw;
                uploadedEmbed.src = reader.result;
            };

            reader.readAsDataURL(file);
        });

//Stores the actual images here
        TextThing.src = "image/thing.png"; 
        baseImage.src = "image/bg/gray.png"; 
        bottomImage.src = "image/bottom_bar.png"; 
        closeBox.src = "image/close_box.png"; 
        stretchBox.src = "image/stretch_box.png"; 
        at.src = "image/at.png"; 
        at2.src = "image/at2.png"; 

//As more icons get introduced, this is the only thing that needs to be changed
        const alltheiconstuff = {
            P: "icons/icon_p.png",
            HEART: "icons/icon_heart.png",
            STAR: "icons/icon_star.png",
        };

        const icons = {};
        for (const key in alltheiconstuff) 
        {
            const img = new Image();
            img.src = alltheiconstuff[key];
            icons[key] = img;
        }

//Start drawing as soon as the stuff loads
        baseImage.onload = () => {
            draw();
        };

        function draw() 
        {
            //Reset.
            canvasContent.clearRect(0, 0, canvas.width, canvas.height);
            
            //This is for the mosaic effect with the background image
            for (let y = 0; y < canvas.height; y += 384) 
            {
                canvasContent.drawImage(baseImage, 0, y, 512, 384);
            }
            
            //This is for the colorized effect with the color picker
            canvasContent.fillStyle = colorPick.value;
            canvasContent.globalAlpha = 0.5; 
            canvasContent.fillRect(0, 0, canvas.width, canvas.height);
            canvasContent.globalAlpha = 1;
            
            //Bottom image is the Replies/Retweets/Likes section, closebox is the bottom of the main post's text box, which are drawn and placed at the very botton, stretchBox is part of the main textbox that stretches down when the post gets longer
            canvasContent.drawImage(closeBox, 0, canvas.height - 384, 512, 384);
            canvasContent.drawImage(stretchBox, 18, 293, 494, (canvas.height - 384)+2);
            canvasContent.drawImage(bottomImage, 0, canvas.height - 384, 512, 384);

            canvasContent.drawImage(TextThing, 0, 0, 512, 384); 

            if (uploadedImage) {
                canvasContent.drawImage(uploadedImage, 40, 24, 80, 80);
            }
            
            if (handle.value != "")
            {

                canvasContent.drawImage(at, 152, 80, 16, 16);
            }
            //Making an array with the date
            let dateInfo = dateInput.value.split("-");

            //All the variables to draw the text itself
            let x = 40;
            let y = 128;
            let mentioning = false;
            let ogheight = canvas.height;
            canvasContent.fillStyle = "#000";
            canvasContent.font = "32px pmd";
            canvasContent.fillStyle = "white";
            canvasContent.textBaseline = "top";
            const letterSpacing = 0;
            let wordx = x;

            
            //Rest of the stuff to be drawn before the main post
            canvasContent.fillText(username.value, 154, 44);
            canvasContent.fillStyle = "grey";
            canvasContent.fillText(handle.value, 170, 66);
            canvasContent.fillStyle = "white";
            canvasContent.fillText(dateInfo[0], 412, 74);
            canvasContent.fillText(months[dateInfo[1]-1]+'.', 404, 52);
            canvasContent.fillText(dateInfo[2], 444, 52);
            
            //Method I used to have before I added the lines automatically going on a new line, probably needs to be changed in the future
            const lines = textinput.value.split("\n");
            const lineHeight = 26;

            //..."Band aid" solutions.
            let skipping = false;
            let extrayoffset = 0;
            let whatTheFuckAmIDoing = false;

            lines.forEach((line, i) => {
                x = 40;
                y = 128 + (i+extrayoffset) * lineHeight;

                let j = -1;
                let currentword = "";
                for (let char of line) 
                {
                    j++
                    
                    if (char == " ")
                    {
                        //Handles are a single word, so text always turns back to white here
                        if (mentioning == true)
                        {
                            mentioning = false;
                            canvasContent.fillStyle = "#ffffff" //I had this line with "==" instead of "=" for a whole hour straight feel free to laugh
                            console.log("1")
                        }
                        currentword = "";
                        wordx = x;
                    }
                    else
                    {
                        currentword+=char;
                    }
                    if (char == "[") //Commands.
                    {
                        skipping = true;
                        let ogj = j;
                        j++;
                        let command = "";

                        //Store the word in square brackets
                        while (j < line.length && line[j] != "]") 
                        {
                            command += line[j];
                            j++
                        }

                        //Can add more command with this other than text color and icons
                        if (command.startsWith("C:")) 
                        {
                            const hex = command.slice(2);
                            if (/^[0-9A-Fa-f]{6}$/.test(hex)) //Make sure this is an ACTUAL hex code first
                            {
                                canvasContent.fillStyle = `#${hex}`;
                            }
                        }
                        if (command.startsWith("I:")) 
                        {
                            const iconKey = command.slice(2);

                            const img = icons[iconKey];
                            if (!img) return;

                            canvasContent.drawImage(img, x, y + 10, img.width*2, img.height*2);
                            x += (img.width*2) + 2; 
                        }
                        j = ogj;
                        continue;
                    }

                    if (char == "]") 
                    {
                        skipping = false;
                        continue;
                    }

                    if (skipping) continue; //Loop skips here if there's still a command

                    if (char != "@")
                    {
                        canvasContent.fillText(char, x, y);
                        x += canvasContent.measureText(char).width + letterSpacing;
                    }
                    else
                    {
                        mentioning = true;
                        //Colored text can override the automatic cyan color here if needed
                            if (canvasContent.fillStyle == "#ffffff")
                            {
                                canvasContent.fillStyle = "#00ffff";
                            }
                        
                        canvasContent.drawImage(at2, x, y+14); //Wanted to make the image white and colorize it later, but the composing operations won't help
                        x += 18;
                    }

                    //Automatically go on a new line if the text is too big
                    if (x > 470)
                    {
                        //Measure the word and uh... "Erase it" (Literally just drawing a black box over it)
                        let fuckyou = canvasContent.measureText(currentword).width;
                        canvasContent.fillStyle = "#202020";
                        canvasContent.fillRect(wordx+2, y+8, fuckyou+2, lineHeight);
                        
                        canvasContent.fillStyle = (mentioning == true) ? "#00ffff" : "#FFFFFF";
                        x = 40;
                        y += lineHeight;
                        
                        extrayoffset++; //So text doesn't overlay if you use 
                        
                        //Whole word needs to include the handle too
                        if (currentword.includes("@")) {
                            whatTheFuckAmIDoing = true;
                            currentword = currentword.replace(/@/g, '');
                            canvasContent.drawImage(at2, x, y+14);
                            x += 18;
                        }
                        canvasContent.fillText(currentword, x, y);
                        x += canvasContent.measureText(currentword).width + letterSpacing;
                        currentword = "";
                        wordx = x;
                        whatTheFuckAmIDoing = false;
                    }
                }
            });
            x = 40;
            y += lineHeight+16;

            //Automatically resize image if it's too big
            let ratio = 1;
            if (uploadedEmbed) 
            {
                if (uploadedEmbed.width > 432) 
                {
                    ratio = 432 / uploadedEmbed.width;
                }
                canvasContent.drawImage(uploadedEmbed, x, y, uploadedEmbed.width * ratio, uploadedEmbed.height * ratio);
                y+= Math.round(uploadedEmbed.height * ratio); //Code breaks if this is not an integer
            }

            //Resize canvas if post is too big
            if (y > 292)
            {
                y -= 292;
                ogheight = 384 + y;
            }
            else
            {
                ogheight = 384;
            }

            //Just draw Replies/Retwees/Likes last
            canvasContent.fillStyle = "grey";
            canvasContent.fillText(replies.value, 72, (canvas.height - 384)+322);
            canvasContent.fillText(retweets.value, 186, (canvas.height - 384)+322);
            canvasContent.fillText(likes.value, 338, (canvas.height - 384)+322);

            //Draw all over again if canvas size changed
            if (canvas.height != ogheight)
            {
                canvas.height = ogheight;
                draw();
            }

        }

        //Update the canvas whenever these are changed
        replies.addEventListener("input", draw);
        retweets.addEventListener("input", draw);
        likes.addEventListener("input", draw);
        dateInput.addEventListener("input", draw);
        textinput.addEventListener("input", draw);
        username.addEventListener("input", draw);
        handle.addEventListener("input", draw);
        colorPick.addEventListener("input", draw);
        
        //Post engagement randomization, could be better, probably
        function randomizeRRL()
        {
            likes.value = Math.floor(Math.pow(Math.random(), 2.5) * 20000);
            retweets.value = Math.floor(likes.value * (0.01 + Math.random() * 0.09));
            replies.value = Math.floor(likes.value * (0.002 + Math.random() * 0.03));
            draw();
        }