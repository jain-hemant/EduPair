# NEET Eligible APP

# conditional statement
# if, if else, nested if

student_class = input("Enter your Class: ")
student_stream = input("Enter your stream name: ")
age = int(input("Enter your age: "))
print("******************************************")
physic = int(input("Enter your Physic marks out of 100: ")) # 74
chemistry = int(input("Enter your Chemistry marks out of 100: ")) # 82
biology = int(input("Enter your Biology marks out of 100: ") )# 90
english = int(input("Enter your English marks out of 100: ") )   # 89

total_marks = 400
obtain_marks = physic + chemistry + biology + english
percent = obtain_marks/total_marks*100

if(student_class=="12" and student_stream == "PCB" and age>=17 and percent>=50 ):
    print("You are eligible for NEET Exam!")
else:
    print("You are not eligible for NEET Exam")
    
if(student_class == "12"):
    if(student_class == "PCB"):
        if(age>=17):
            if(percent>=50):
                    print("You are eligible for NEET Exam!")
else:
    print("You are not eligible for NEET Exam")

