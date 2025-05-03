let str = "abc";
let N = 3;
let arr = []
for(let i=0; i<N; i++){
  for(let j=i+1; j<N+1; j++){
    let range = ""
    for(let k=i; k<j; k++){
      range += str[k]
    }
  arr.push(range)
  }
}
console.log(arr)

