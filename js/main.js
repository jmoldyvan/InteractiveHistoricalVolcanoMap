//Get a dog photo from the dog.ceo api and place the photo in the DOM
const monster_url = "https://api.open5e.com/monsters/?page=2"
const select = document.querySelector('.type')
const resetbutton = document.querySelector('.resetbutton')
let monster_list = document.querySelector('.monster_list')

fetch(monster_url)
    .then(res => {
        return res.json();
    })
    .then(data => {
        const monsterObj = data.results; //turn method into obj

        typeOldArr = []
        monsterObj.forEach(element => {
            typeObj = element.type
            typeOldArr.push(typeObj)
            typeArr = [...new Set(typeOldArr)];
        });
        typeArr.forEach(selection => {
            const option = document.createElement('option')
            option.value = selection
            option.innerText = selection//display breed inside the thing
            select.appendChild(option)
        });

        console.log(typeArr)

    })

// need to append a k,v to have corresponding name:type
fetch(monster_url)
    .then(res => {
        return res.json();
    })
    .then(data => {
        const monsterObj = data.results;
        nt_dict = []
        monsterObj.forEach(elem => {
            nameObj = elem.name
            typeObj = elem.type
            nt_dict.push({
                key: nameObj,
                value: typeObj
            })

        })

        console.log(nt_dict)
    });



// on change of option value look through the monsterObj to find corresnponding name
select.addEventListener('change', event => {
    monster_list_arr = []

    nt_dict.forEach(elem => {
        if (event.target.value == elem.value) {
            // monster_list_arr.push(elem.key)
            let newline = document.createElement('h4')
            newline.value = elem.key
            newline.innerHTML = elem.key
            monster_list.appendChild(newline)
            resetbutton.addEventListener('click', event => {
                newline.remove()
            })
        }
    });

})
