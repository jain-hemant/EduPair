def stringPrime(N,string):
    arr = []
    
    for i in range(N):
        for j in range(i+1,N+1):
            s = string[i:j]
            arr.append(s)
    print(arr)
