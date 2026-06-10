package com.farmacia.service;

import com.farmacia.exception.ResourceNotFoundException;
import com.farmacia.model.Medicamento;
import com.farmacia.repository.MedicamentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicamentoService {

    private final MedicamentoRepository repository;

    public List<Medicamento> listarTodos() {
        return repository.findAll();
    }

    public Medicamento buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicamento nao encontrado: " + id));
    }

    public List<Medicamento> buscarPorNome(String nome) {
        return repository.findByNomeContainingIgnoreCase(nome);
    }

    public List<Medicamento> buscarPorCategoria(String categoria) {
        return repository.findByCategoria(categoria);
    }

    public List<Medicamento> listarEstoqueBaixo() {
        return repository.findEstoqueBaixo();
    }

    public List<Medicamento> listarVencendo(int dias) {
        return repository.findVencendoEm(LocalDate.now().plusDays(dias));
    }

    public List<Medicamento> listarVencidos() {
        return repository.findVencidos();
    }

    public List<String> listarCategorias() {
        return repository.findAllCategorias();
    }

    @Transactional
    public Medicamento criar(Medicamento medicamento) {
        if (medicamento.getCodigoBarras() != null) {
            repository.findByCodigoBarras(medicamento.getCodigoBarras())
                    .ifPresent(m -> { throw new IllegalArgumentException("Codigo de barras ja cadastrado"); });
        }
        return repository.save(medicamento);
    }

    @Transactional
    public Medicamento atualizar(Long id, Medicamento dados) {
        Medicamento existente = buscarPorId(id);
        existente.setNome(dados.getNome());
        existente.setPrincipioAtivo(dados.getPrincipioAtivo());
        existente.setCategoria(dados.getCategoria());
        existente.setFabricante(dados.getFabricante());
        existente.setQuantidade(dados.getQuantidade());
        existente.setQuantidadeMinima(dados.getQuantidadeMinima());
        existente.setPreco(dados.getPreco());
        existente.setDataValidade(dados.getDataValidade());
        existente.setRequerReceita(dados.getRequerReceita());
        return repository.save(existente);
    }

    @Transactional
    public void ajustarEstoque(Long id, int quantidade) {
        Medicamento m = buscarPorId(id);
        int novaQtd = m.getQuantidade() + quantidade;
        if (novaQtd < 0) throw new IllegalArgumentException("Estoque insuficiente");
        m.setQuantidade(novaQtd);
        repository.save(m);
    }

    @Transactional
    public void excluir(Long id) {
        buscarPorId(id);
        repository.deleteById(id);
    }
}
