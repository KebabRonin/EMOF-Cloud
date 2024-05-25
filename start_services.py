import subprocess

#python_source = ".venv/Scripts/python"
python_source = "python"

process1 = subprocess.Popen([python_source, "main.py"],cwd=r'AdminFormMicroservice') 
process2 = subprocess.Popen([python_source, "main.py"],cwd=r'AdminMicroservice')
process3 = subprocess.Popen([python_source, "main.py"],cwd=r'AuthenticationMicroservice')
process4 = subprocess.Popen([python_source, "main.py"],cwd=r'ExploreMicroservice') 
process5 = subprocess.Popen([python_source, "main.py"],cwd=r'FormMicroservice')
process6 = subprocess.Popen([python_source, "main.py"],cwd=r'GatewayMicroservice')
process7 = subprocess.Popen([python_source, "main.py"],cwd=r'StatisticsMicroservice')

process1.wait()
process2.wait()
process3.wait()
process4.wait()
process5.wait()
process6.wait()
process7.wait()